
module.exports.register = function register(registry) {
  registry.treeProcessor(function () {
    const self = this
    self.process(function (doc) {
      const blocks = doc.findBy({context: 'listing', style: 'source'})
        .filter((b) => b.getAttribute('language') === 'python' && b.getAttribute('option-dynamic'))
      console.log(blocks)
      /*
      for (const block of blocks) {
        const content = block.getContent()
        const parent = block.getParent()
        const parentBlocks = parent.getBlocks()
        let blockIndex = parentBlocks['$find_index'](block)
        const caseOptionFound = content.match(caseOptionRx)
        if (caseOptionFound) {
          blockIndex += 1
          const mpirunCaseOptBlock = self.createListingBlock(block, caseOptionFound[0], {role: 'mpirun-caseopt'})
          mpirunCaseOptBlock.setTitle('Case option')
          parentBlocks.splice(blockIndex, 0, mpirunCaseOptBlock)
        }
        const caseConfigFileOptionFound = content.match(caseConfigFileOptionRx)
        if (caseConfigFileOptionFound) {
          blockIndex += 1
          const mpirunCaseConfigFileOptBlock = self.createListingBlock(block,   caseConfigFileOptionFound[0], {role: 'mpirun-caseconfigfileopt'})
          mpirunCaseConfigFileOptBlock.setTitle('Case config file option')
          parentBlocks.splice(blockIndex, 0, mpirunCaseConfigFileOptBlock)
        }
      }*/
      return doc
    })
  })
}
