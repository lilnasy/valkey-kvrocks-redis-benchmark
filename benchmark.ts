import { spawn } from "node:child_process"
import { readFileSync, writeFileSync } from "node:fs"
import { csvParse } from "d3-dsv"

console.log("Starting ValKey...")
const valkeyServer = spawn("docker", "run --rm --name valkey -p 6379:6379 valkey/valkey:8.0.2-bookworm".split(" "))
await new Promise<void>(resolve => valkeyServer.stdout!.on("data", data =>
    data.toString().includes("Ready to accept connections") && resolve()
))
console.log("Benchmarking ValKey...")
const valkeyBenchmarkOutput = await runBenchmark("docker run --rm --network host redis:7.4.2-bookworm redis-benchmark -3 -c 500 -P 10 -q -p 6379 --csv")
valkeyServer.kill()
console.log("Stopped ValKey.")

console.log("Starting Kvrocks...")
const kvrocksServer = spawn("docker", "run --rm --name kvrocks -p 6666:6666 apache/kvrocks:nightly-20250119-571b022 --workers 1 --rocksdb.block_cache_size 128".split(" "))
await new Promise<void>(resolve => kvrocksServer.stdout!.on("data", data =>
    data.toString().includes("Ready to accept connections") && resolve()
))
console.log("Benchmarking Kvrocks...")
const kvrocksBenchmarkOutput = await runBenchmark("docker run --rm --network host redis:7.4.2-bookworm redis-benchmark -3 -c 500 -P 10 -q -p 6666 --csv")
kvrocksServer.kill()
console.log("Benchmark complete.")

const results = parseCommandOutput(valkeyBenchmarkOutput, kvrocksBenchmarkOutput)
const mermaid = renderChart(results)
const md = readFileSync("README.md", "utf-8")
writeFileSync("README.md", md.replace(/(?<=<!-- chart-begin -->)[\S\s]*(?=<!-- chart-end -->)/, mermaid))
console.log("Results written into README.md")


function runBenchmark(command: string) {
    const [ executable, ...args ] = command.split(" ") 
    const process = spawn(executable, args)
    process.stdout.setEncoding("utf-8")
    let result = ""
    process.stdout.on("data", data => result += data)
    return new Promise<string>(resolve => process.on("exit", () => resolve(result)))
}

interface CommandPerformance {

    /**
     * Name of the redis command (GET, SET, etc.)
     */
    test: string

    rps: string

    avg_latency_ms: string

    min_latency_ms: string

    p50_latency_ms: string

    p95_latency_ms: string

    p99_latency_ms: string

    max_latency_ms: string
}

function parseCommandOutput(valkeyCsvData: string, kvrocksCsvData: string) {
    const valkeyResults: CommandPerformance[] = csvParse(valkeyCsvData)
    const kvrocksResults: CommandPerformance[] = csvParse(kvrocksCsvData)
    return { valkeyResults, kvrocksResults }
}

function renderChart({ valkeyResults, kvrocksResults }: ReturnType<typeof parseCommandOutput>) {
    return `
\`\`\`mermaid
---
config:
    themeVariables:
        xyChart:
            plotColorPalette: "#5cb3ff80, #f88f4f80"
---
xychart-beta horizontal
title "ValKey (memory-only) vs Kvrocks (memory + NVMe)"
x-axis [${valkeyResults.map(row => `"${row.test}"`).join(", ")}]
y-axis "1,000 requests per second (higher is better)"
bar [${valkeyResults.map(row => Number(row.rps) / 1000).join(", ")}]
bar [${kvrocksResults.map(row => Number(row.rps) / 1000).join(", ")}]
\`\`\`
`
}
