const fs = require('fs');

async function main() {
  const res = await fetch('https://openrouter.ai/api/v1/models');
  const json = await res.json();
  const freeVision = json.data.filter(m => 
    m.pricing.prompt === "0" && 
    m.pricing.completion === "0" && 
    m.architecture && 
    m.architecture.modality &&
    m.architecture.modality.includes('image')
  );
  console.log(freeVision.map(m => m.id));
}
main();
