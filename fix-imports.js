const fs = require('fs');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if(file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
    }
  });
  return results;
}
walk('d:/jewellery/my-app/components').forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let newContent = content.replace(/from \"(\.\.\/)+lib\/utils\"/g, 'from \"@/lib/utils\"');
  if(content !== newContent) {
    fs.writeFileSync(f, newContent, 'utf8');
    console.log('Fixed', f);
  }
});
