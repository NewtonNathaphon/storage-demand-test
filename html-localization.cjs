'use strict';

const VOID_ELEMENTS=new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
const RAW_TEXT_ELEMENTS=new Set(['script','style']);
const ATTRIBUTE_TRANSLATIONS=[
 ['data-en-placeholder','placeholder'],
 ['data-en-alt','alt'],
 ['data-en-aria-label','aria-label']
];

function tagEnd(source,start){
 let quote=null;
 for(let index=start+1;index<source.length;index++){
  const char=source[index];
  if(quote){if(char===quote)quote=null;continue;}
  if(char==='"'||char==="'"){quote=char;continue;}
  if(char==='>')return index;
 }
 return source.length-1;
}

function parseStartTag(raw){
 const nameMatch=raw.match(/^<\s*([^\s/>]+)/);
 if(!nameMatch)return null;
 const name=nameMatch[1].toLowerCase();
 const attributes=[];
 let index=nameMatch[0].length;
 const end=raw.length-1;
 while(index<end){
  while(index<end&&/\s/.test(raw[index]))index++;
  if(index>=end||raw[index]==='/')break;
  const nameStart=index;
  while(index<end&&!/[\s=/>]/.test(raw[index]))index++;
  const attributeName=raw.slice(nameStart,index);
  if(!attributeName){index++;continue;}
  while(index<end&&/\s/.test(raw[index]))index++;
  let value=null,valueStart=null,valueEnd=null,quote=null;
  if(raw[index]==='='){
   index++;
   while(index<end&&/\s/.test(raw[index]))index++;
   if(raw[index]==='"'||raw[index]==="'"){
    quote=raw[index++];valueStart=index;
    while(index<end&&raw[index]!==quote)index++;
    valueEnd=index;value=raw.slice(valueStart,valueEnd);
    if(index<end)index++;
   }else{
    valueStart=index;
    while(index<end&&!/[\s>]/.test(raw[index]))index++;
    valueEnd=index;value=raw.slice(valueStart,valueEnd);
   }
  }
  attributes.push({name:attributeName.toLowerCase(),value,valueStart,valueEnd,quote});
 }
 return {name,attributes,selfClosing:/\/\s*>$/.test(raw)};
}

function attribute(parsed,name){return parsed.attributes.find(item=>item.name===name);}

function encodeAttributeDelimiter(value,quote){
 if(quote==='"')return value.replaceAll('"','&quot;');
 if(quote==="'")return value.replaceAll("'",'&#39;');
 return value;
}

function editAttributes(raw,parsed,changes){
 const replacements=[];
 const additions=[];
 for(const [name,value] of changes){
  const current=attribute(parsed,name);
  if(current&&current.valueStart!==null){
   const quote=current.quote||'"';
   const replacement=encodeAttributeDelimiter(value,quote);
   replacements.push({start:current.valueStart,end:current.valueEnd,value:current.quote===null?`${quote}${replacement}${quote}`:replacement});
  }
  else if(!current)additions.push(` ${name}="${encodeAttributeDelimiter(value,'"')}"`);
 }
 replacements.sort((a,b)=>b.start-a.start);
 for(const replacement of replacements)raw=raw.slice(0,replacement.start)+replacement.value+raw.slice(replacement.end);
 if(additions.length){
  const close=raw.match(/\/\s*>$|>$/);
  const position=close?close.index:raw.length;
  raw=raw.slice(0,position)+additions.join('')+raw.slice(position);
 }
 return raw;
}

function rawCloseStart(source,from,name){
 const lower=source.toLowerCase();
 let index=lower.indexOf(`</${name}`,from);
 while(index>=0){
  const after=lower[index+name.length+2];
  if(after==='>'||/\s/.test(after))return index;
  index=lower.indexOf(`</${name}`,index+2);
 }
 return -1;
}

function tokenize(source){
 const tokens=[];
 const roots=[];
 const stack=[];
 let index=0;
 const add=token=>{
  token.parent=stack.at(-1)||null;
  tokens.push(token);
  if(token.parent)token.parent.children.push(token);else roots.push(token);
  return token;
 };
 while(index<source.length){
  if(source[index]!=='<'){
   const end=source.indexOf('<',index);
   add({type:'text',raw:source.slice(index,end<0?source.length:end)});
   index=end<0?source.length:end;
   continue;
  }
  if(source.startsWith('<!--',index)){
   const found=source.indexOf('-->',index+4);
   const end=found<0?source.length:found+3;
   add({type:'opaque',raw:source.slice(index,end)});index=end;continue;
  }
  if(source.startsWith('<![CDATA[',index)){
   const found=source.indexOf(']]>',index+9);
   const end=found<0?source.length:found+3;
   add({type:'opaque',raw:source.slice(index,end)});index=end;continue;
  }
  const end=tagEnd(source,index);
  const raw=source.slice(index,end+1);
  const closing=raw.match(/^<\s*\/\s*([^\s>]+)/);
  if(closing){
   const name=closing[1].toLowerCase();
   add({type:'end',raw,name});
   for(let cursor=stack.length-1;cursor>=0;cursor--){
    if(stack[cursor].name===name){stack.length=cursor;break;}
   }
   index=end+1;continue;
  }
  if(/^<\s*[!?]/.test(raw)){add({type:'opaque',raw});index=end+1;continue;}
  const parsed=parseStartTag(raw);
  if(!parsed){add({type:'text',raw:'<'});index++;continue;}
  const element=add({type:'start',raw,name:parsed.name,parsed,children:[]});
  index=end+1;
  if(RAW_TEXT_ELEMENTS.has(parsed.name)&&!parsed.selfClosing){
   const closeStart=rawCloseStart(source,index,parsed.name);
   if(closeStart<0){add({type:'raw',raw:source.slice(index)});index=source.length;continue;}
   stack.push(element);
   add({type:'raw',raw:source.slice(index,closeStart)});
   stack.pop();
   const closeEnd=tagEnd(source,closeStart);
   add({type:'end',raw:source.slice(closeStart,closeEnd+1),name:parsed.name});
   index=closeEnd+1;continue;
  }
  if(!parsed.selfClosing&&!VOID_ELEMENTS.has(parsed.name))stack.push(element);
 }
 return {tokens,roots};
}

function nestedVisibleText(element){
 const result=[];
 const visit=token=>{
  if(token.type==='raw'||token.type==='opaque')return;
  if(token.type==='text'){if(token.raw.trim())result.push(token.raw.trim());return;}
  if(token.type==='start'){
   if(attribute(token.parsed,'data-en'))return;
   for(const child of token.children)visit(child);
  }
 };
 for(const child of element.children)if(child.type==='start')visit(child);
 return result.join(' ').trim();
}

function translatedText(rawTranslation,protectedText){
 if(!protectedText)return rawTranslation;
 const translation=rawTranslation.trimEnd();
 if(!translation.endsWith(protectedText))return rawTranslation;
 return translation.slice(0,-protectedText.length).trimEnd();
}

function localizeHtml(source,options={}){
 const document=tokenize(source);
 for(const token of document.tokens){
  if(token.type!=='start')continue;
  const changes=[];
  for(const [dataName,targetName] of ATTRIBUTE_TRANSLATIONS){
   const translated=attribute(token.parsed,dataName);
   if(translated&&translated.value!==null)changes.push([targetName,translated.value]);
  }
  if(options.transformTag)options.transformTag(token,changes,attribute);
  if(changes.length)token.raw=editAttributes(token.raw,token.parsed,changes);
 }
 for(const element of document.tokens){
  if(element.type!=='start')continue;
  const translated=attribute(element.parsed,'data-en');
  if(translated?.value===null||translated===undefined)continue;
  const directText=element.children.filter(child=>child.type==='text'&&child.raw.trim());
  if(!directText.length)continue;
  const first=directText[0];
  const leading=first.raw.match(/^\s*/)[0];
  const trailing=first.raw.match(/\s*$/)[0];
  first.raw=leading+translatedText(translated.value,nestedVisibleText(element))+trailing;
  for(const extra of directText.slice(1))extra.raw=extra.raw.match(/^\s*/)[0]+extra.raw.match(/\s*$/)[0];
 }
 if(options.transformText){
  for(const token of document.tokens)if(token.type==='text')options.transformText(token);
 }
 if(options.transformRaw){
  for(const token of document.tokens)if(token.type==='raw')options.transformRaw(token);
 }
 return document.tokens.map(token=>token.raw).join('');
}

function renderEnglishHomepage(source){
 return localizeHtml(source,{
  transformTag(token,changes,getAttribute){
   const current=name=>getAttribute(token.parsed,name)?.value;
   if(token.name==='html'){
    changes.push(['lang','en']);
    changes.push(['data-page-language','en']);
   }
   if(token.name==='meta'){
    if(current('name')==='description')changes.push(['content','Planned self storage near Rama 3, Bangkok, with size guidance for personal belongings, furniture and small business inventory. Location, opening and rooms are not yet confirmed.']);
    const property=current('property');
    if(property==='og:title')changes.push(['content','Self Storage Rama 3, Bangkok | StorageBuddy']);
    if(property==='og:description')changes.push(['content','Plan storage near Rama 3 and register for confirmed location, opening and room updates.']);
    if(property==='og:url')changes.push(['content','https://storagebuddyth.com/en/']);
    if(property==='og:image')changes.push(['content','https://storagebuddyth.com/assets/buddy_banner_en.webp']);
   }
   if(token.name==='link'&&current('rel')==='canonical')changes.push(['href','https://storagebuddyth.com/en/']);
   for(const name of ['src','href']){
    const value=current(name);
    if(value?.startsWith('assets/'))changes.push([name,'/'+value]);
   }
   for(const name of ['srcset','imagesrcset','data-en-srcset','data-th-srcset']){
    const value=current(name);
    if(value)changes.push([name,value.replace(/(^|,\s*)assets\//g,'$1/assets/')]);
   }
   const englishPaths=new Map([
    ['/register/','/register/?lang=en'],
    ['/guides/choose-storage-size/','/en/guides/choose-storage-size/'],
    ['/guides/moving-renovation-checklist/','/en/guides/moving-renovation-checklist/'],
    ['/guides/sme-stock-document-plan/','/en/guides/sme-stock-document-plan/'],
    ['/sizes/','/en/sizes/'],
    ['/personal-storage/','/en/personal-storage/'],
    ['/business-storage/','/en/business-storage/'],
    ['/location/rama-3/','/en/location/rama-3/']
   ]);
   if(englishPaths.has(current('href')))changes.push(['href',englishPaths.get(current('href'))]);
  },
  transformText(token){
   if(token.parent?.name==='title')token.raw='Self Storage Rama 3, Bangkok | StorageBuddy';
  },
  transformRaw(token){
   if(token.parent?.name==='script')token.raw=token.raw.replace("const pathLanguage='th';","const pathLanguage='en';");
  }
 });
}

module.exports={localizeHtml,renderEnglishHomepage};
