const TodoList = artifacts.require('./TodoList.sol')

contract('TodoList', (accounts) => {
  before(async () => {
    this.todolist = await TodoList.deployed()
  })

  it('deployed succesfully', async()=>{
    const address = await this.todolist.address
    assert.notEqual(address, 0x0)
    assert.notEqual(address, null)
    assert.notEqual(address, '')
    assert.notEqual(address, undefined)
  })

  it('list tasks', async () => {
    const taskCount = await this.todolist.taskCount()
    const task = await this.todolist.tasks(taskCount)
    assert.equal(task.id.toNumber(), taskCount.toNumber())
  })
})
