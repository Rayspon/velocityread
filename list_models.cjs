async function main() {
  const res = await fetch('https://openrouter.ai/api/v1/models');
  const json = await res.json();
  const llamaVision = json.data.filter(m => 
    m.id.includes('llama') && m.id.includes('vision') && m.pricing.prompt === "0"
  );
  console.log(llamaVision.map(m => m.id));
}
main();
