(async () => {
  try {
    const r = await fetch('http://localhost:9002')
    console.log(r.status)
  } catch (e) {
    console.error('ERR', e && e.message ? e.message : e)
    process.exit(1)
  }
})()
