const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');

function loadPlaywright(){
 if(process.env.PLAYWRIGHT_PATH){
  try{return require(process.env.PLAYWRIGHT_PATH);}catch(error){
   if(error.code!=='MODULE_NOT_FOUND')throw error;
   return require(require.resolve('playwright',{paths:[process.env.PLAYWRIGHT_PATH]}));
  }
 }
 const projectRoot=path.join(__dirname,'..');
 try{return require(require.resolve('playwright',{paths:[projectRoot]}));}catch(error){
  if(error.code!=='MODULE_NOT_FOUND')throw error;
  throw new Error(`Local Playwright not found in ${projectRoot}. Run npm install or set PLAYWRIGHT_PATH explicitly.`);
 }
}

async function launchBrowser(options={}){
 const {chromium}=loadPlaywright();
 const executablePath=process.env.CHROME_PATH||chromium.executablePath();
 if(!fs.existsSync(executablePath))throw new Error(`Browser executable does not exist: ${executablePath}`);
 return chromium.launch({...options,headless:options.headless??true,executablePath});
}

const outputDir=process.env.TEST_OUTPUT_DIR||path.join(os.tmpdir(),'storagebuddy-browser-regression');
fs.mkdirSync(outputDir,{recursive:true});
const outputPath=name=>path.join(outputDir,name);

module.exports={launchBrowser,outputDir,outputPath};