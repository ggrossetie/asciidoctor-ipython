const child_process = require('node:child_process')

const conumRx = /\s*<i class="conum" data-value="[0-9]+"><\/i><b>[^>]+<\/b>/g
const figShowRx = /fig.show\(\)/g

const ipythonTemplate = (pyCodes) => {
  return `from IPython.core.interactiveshell import InteractiveShell
from IPython.utils.capture import capture_output
import json
import sys

shell = InteractiveShell()
results = []

shell.run_cell('%colors nocolor')

${pyCodes.map((pyCode, index) => {
    return `
with capture_output() as io${index}:
    r${index} = shell.run_cell(${pyCode})
    results.append({
        'success': r${index}.success,
        'stderr': io${index}.stderr,
        'stdout': io${index}.stdout
    })

`
}).join('')}

sys.stderr.write(json.dumps(results))
`
}

module.exports.register = function register(registry) {
  registry.treeProcessor(function () {
    const self = this
    self.process(function (doc) {
      const blocks = doc.findBy({context: 'listing', style: 'source'})
        .filter((b) => b.getAttribute('language') === 'python' && b.isOption('dynamic'))
      const ipython = ipythonTemplate(blocks.map((b) => {
        const code = b.getContent()
          .replaceAll(conumRx, '')
          .replaceAll(figShowRx, `import sys
print(fig.write_html(file=sys.stdout, include_plotlyjs=False))`)
        return JSON.stringify(code)
      }))
      const result = child_process.spawnSync('python3', ['-'], {
        shell: false,
        input: ipython,
        stdio: ['pipe', 'pipe', 'pipe'],
        maxBuffer: 1024 * 1024 * 50
      })
      console.log({result})
      console.log({stdout: result.stdout.toString('utf8')})
      console.log({stderr: result.stderr.toString('utf8')})
      if (result.status !== 0) {
        // something went wrong!
      } else {
        const response = JSON.parse(result.stderr.toString('utf8'))
        for (const [index, block] of blocks.entries()) {
          try {
            const parent = block.getParent()
            const parentBlocks = parent.getBlocks()
            const blockIndex = parentBlocks['$find_index'](block) + 1
            const exampleBlock = self.createExampleBlock(block, '', { 'collapsible-option': '' }, {'content_model': 'compound'})
            exampleBlock.setTitle('Results')
            // option for raw content (Plotly)
            if (block.isOption('raw')) {
              exampleBlock.append(self.createPassBlock(exampleBlock, response[index].stdout.toString('utf8'), {role: 'dynamic-py-result'}))
            } else {
              exampleBlock.append(self.createLiteralBlock(exampleBlock, response[index].stdout.toString('utf8'), {role: 'dynamic-py-result'}))
            }
            parentBlocks.splice(blockIndex, 0, exampleBlock)
          } catch (err) {
            console.log({err})
          }
        }
      }
      return doc
    })
  })
}
