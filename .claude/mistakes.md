# Mistakes log — storage-demand-test

Lessons from past sessions. Read before working; append when something goes wrong.

## 2026-09-11 — Testing the /api/estimate endpoint

**Burned the production rate limit with a polling loop.**
I waited for a deploy using `until curl ... /api/estimate | grep -q ...` with a *valid*
payload. The limit is 5 requests per IP per hour, so the loop ate the whole quota and
blocked real verification for 40 minutes.
Fix: poll with an INVALID body (`{"description":"x"}`). That 400s inside `validateInput`,
before the rate-limit check, so it is free — and it still proves Functions routing is live.
Each deployment alias (`https://<hash>.getstorage.pages.dev`) is a separate origin with its
own fresh quota; iterate there, verify on production once.

**A diagnostic probe that contaminated its own experiment.**
I gated a debug branch on a sentinel string inside `description` — the exact field under
test. The prefix changed the model's behaviour, so the probe measured something other than
the real request.
Fix: trigger diagnostics from a separate body field, never from the data being tested.

**Chased a wrong root cause for several deploys.**
Thai estimates came back with invented items, so I concluded "Thai comprehension failure",
then "encoding corruption". Neither was quite right: transport was provably clean (verified
by stubbing `fetch` locally and printing the outgoing body) and the model is simply
NON-DETERMINISTIC on Thai — identical bytes gave a correct list once and a confabulated one
before.
Fix: for any prompt/model change here, run the same input 3+ times before concluding
anything. One sample proves nothing. Get raw model output early instead of reasoning about
symptoms — the single diagnostic deploy that returned `model`, `stop_reason`, block types
and raw text was worth more than four blind iterations.

**Assumed the environment had no outbound network.**
A memory said curl always fails here. It worked fine this session.
Fix: test it (`curl -s -o /dev/null -w "%{http_code}" https://...`) instead of assuming.

## Model choice for this endpoint

`claude-opus-5` does NOT work for the sizing prompt — it treats an item list without
measurements as too weak to estimate and returns `insufficient_info` every time, at any
effort level, even with the original prompt wording. Verified live. Use `claude-sonnet-5`.
Do not "upgrade" the model here without re-running the Thai checks.
