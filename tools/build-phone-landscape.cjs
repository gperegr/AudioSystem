// Mirror phone-only rules for iPhones whose landscape viewport is wider than 700 CSS pixels.
const fs=require('node:fs');
const css=fs.readFileSync('styles/app.css','utf8');let output='/* Generated from phone rules in app.css by tools/build-phone-landscape.cjs. */\n';
const media=/@media\s*([^\{]+)\{/g;let match;
while((match=media.exec(css))){
 let depth=1,i=media.lastIndex,quote='',comment=false;
 for(;i<css.length&&depth;i++){
  const c=css[i],n=css[i+1];
  if(comment){if(c==='*'&&n==='/'){comment=false;i++;}continue;}
  if(quote){if(c==='\\')i++;else if(c===quote)quote='';continue;}
  if(c==='/'&&n==='*'){comment=true;i++;continue;}
  if(c==='"'||c==="'"){quote=c;continue;}
  if(c==='{')depth++;else if(c==='}')depth--;
 }
 if(depth)throw Error('Unclosed media rule');
 if(/max-width\s*:\s*700px/.test(match[1]))output+=css.slice(media.lastIndex,i-1)+'\n';
 media.lastIndex=i;
}
if(process.argv.includes('--check')){
 if(!fs.existsSync('styles/phone-landscape.css')||fs.readFileSync('styles/phone-landscape.css','utf8')!==output)throw Error('phone-landscape.css is out of date');
}else fs.writeFileSync('styles/phone-landscape.css',output);
