# redis-alternatives-benchmark

## Running the Benchmark and Processing Results

This repository includes a Node.js script to run the benchmark, process the CSV output, and generate Markdown with a Mermaid diagram.

### Prerequisites

- Ensure you have Node.js and npm installed on your system.

### Setup

1. Clone the repository:
   ```sh
   git clone https://github.com/lilnasy/redis-alternatives-benchmark.git
   cd redis-alternatives-benchmark
   ```

2. Install the dependencies:
   ```sh
   npm install
   ```

### Running the Benchmark

To run the benchmark and process the results, execute the following command:
```sh
npm start
```

This will run the benchmark, process the CSV output, and generate a Markdown file (`benchmark.md`) with a Mermaid diagram.

### Viewing the Generated Markdown

To view the generated Markdown with the Mermaid diagram, you can use any Markdown viewer that supports Mermaid diagrams. For example, you can use VSCode with the Mermaid Markdown Preview extension.

1. Open `benchmark.md` in your Markdown viewer.
2. Ensure the viewer supports Mermaid diagrams to visualize the XY chart.
