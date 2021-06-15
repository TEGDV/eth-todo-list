App = {
  loading: false,
  contracts: {},
  load: async () => {
    await App.loadWeb3();
    await App.loadAccount();
    await App.loadContract();
    await App.renderTasks();
    await App.render();
  },
  loadWeb3: async () => {
    if (typeof web3 !== "undefined") {
      App.web3Provider = window.ethereum;
    } else {
      window.alert("Please connect to Metamask.");
    }
    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(ethereum);
      try {
        // Request account access if needed
        App.accounts = await ethereum.request({ method: "eth_accounts" });

        // Acccounts now exposed
        web3.eth.sendTransaction({
          /* ... */
        });
      } catch (error) {
        // User denied account access...
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = web3.currentProvider;
      window.web3 = new Web3(web3.currentProvider);
      // Acccounts always exposed
      web3.eth.sendTransaction({
        /* ... */
      });
    }
    // Non-dapp browsers...
    else {
      console.log("Non-Ethereum browser detected. You should consider trying MetaMask!");
    }
  },

  loadAccount: async () => {
    App.account = App.accounts[0];
  },
  renderTasks: async () => {
    const taskCount = await App.todolist.taskCount().then(async (count) => count.toNumber());
    const $taskTemplate = $(".taskTemplate");

    for (var i = 1; i <= taskCount; i++) {
      //Fetch values
      const task = await App.todolist.tasks(i);
      const taskId = task.id.toNumber();
      const taskContent = task.content;
      const taskCompleted = task.completed;
      //Render in html
      const $newTaskTemplate = $taskTemplate.clone();
      $newTaskTemplate.prop("id", "task" + taskId);
      $newTaskTemplate.find(".content").text(taskContent);
      $newTaskTemplate.find("input").prop("name", taskId).prop("checked", taskCompleted).on("click", App.toggleCompleted);

      if (taskCompleted) {
        $("#completedTaskList").append($newTaskTemplate);
        $newTaskTemplate.show();
      } else {
        $("#taskList").append($newTaskTemplate);
        $newTaskTemplate.show();
      }
    }
  },
  render: async () => {
    if (App.loading) {
      return;
    }
    App.setLoading(true);
    $("#account").text(App.account);
    App.setLoading(false);
  },
  createTask: async () => {
    App.setLoading(true);
    const content = $("#newTask").val();
    const result = await App.todolist.createTask(content, { from: App.account });
    const newTask = result.logs[0].args;
    const newTaskId = newTask.id.toNumber();
    const newTaskContent = newTask.content;
    const newTaskCompleted = newTask.completed;
    const $taskTemplate = $(".taskTemplate");
    //Render in html
    const $newTaskTemplate = $taskTemplate.clone();
    $newTaskTemplate.prop("id", "task" + newTaskId);
    $newTaskTemplate.find(".content").text(newTaskContent);
    $newTaskTemplate.find("input").prop("name", newTaskId).prop("checked", newTaskCompleted).on("click", App.toggleCompleted);

    $("#taskList").append($newTaskTemplate);
    $newTaskTemplate.show();

    App.setLoading(false);
  },
  toggleCompleted: async (e) => {
    App.setLoading(true);
    const taskId = e.target.name;
    const result = await App.todolist.toggleCompleted(taskId, { from: App.account });
    const event = result.logs[0].args;
    if (event.completed) {
      const $task = $("#taskList").find("#task" + event.id.toNumber());
      const $toggledTask = $task.clone();
      $task.remove();
      $("#completedTaskList").append($toggledTask);
    } else {
      const $task = $("#completedTaskList").find("#task" + event.id.toNumber());
      const $toggledTask = $task.clone();
      $task.remove();
      $("#taskList").append($toggledTask);
    }
    App.setLoading(false);
  },
  setLoading: (boolean) => {
    App.loading = boolean;
    const loader = $("#loader");
    const content = $("#content");
    if (App.loading) {
      loader.show();
      content.hide();
    } else {
      loader.hide();
      content.show();
    }
  },
  loadContract: async () => {
    const todolist = await $.getJSON("TodoList.json");
    App.contracts.TodoList = TruffleContract(todolist);
    App.contracts.TodoList.setProvider(App.web3Provider);
    App.todolist = await App.contracts.TodoList.deployed();
  },
};
$(() => {
  $(window).load(() => {
    App.load();
  });
});
