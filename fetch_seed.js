const maxRetries = 10;
async function tryFetch() {
  for(let i=0; i<maxRetries; i++) {
    try {
      const res = await fetch('http://localhost:3000/api/seed');
      const text = await res.text();
      if(res.ok) {
        console.log("SUCCESS:", text);
        return;
      } else {
        console.log("API returned error:", text);
      }
    } catch(e) {
      console.log("Waiting for Next.js to start...", e.message);
    }
    await new Promise(r => setTimeout(r, 2000));
  }
}
tryFetch();
