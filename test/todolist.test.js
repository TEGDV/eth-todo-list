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
    assert.equal(task.completed, false)
    assert.equal(task.content, 'Check out dappuniversity.com')
    assert.equal(taskCount.toNumber(), 1)
  })

  it('Creates tasks', async () =>{
    const result = await this.todolist.createTask('A new task')
    const taskCount = await this.todolist.taskCount()
    assert.equal(taskCount, 2)
    const event = result.logs[0].args
    assert.equal(event.id.toNumber(),2)
    assert.equal(event.content, 'A new task')
    assert.equal(event.completed, false)

  })
})
