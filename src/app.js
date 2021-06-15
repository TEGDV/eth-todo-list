App = {
  loading: false,
  contracts: {},
  load: async () => {
    await App.loadWeb3();
    await App.loadAccount();
    await App.loadContract();
    await App.render();
    await App.renderTasks();
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
    const taskCount = await App.todolist.taskCount().then((count) => count.toNumber())
    const $taskTemplate = $(".taskTemplate");
    for (var i = 1; i <= taskCount; i++) {
      //Fetch values
      const task = await App.todolist.tasks(i);
      const taskId = task.id.toNumber();
      const taskContent = task.content;
      const taskCompleted = task.completed;
      console.log(taskContent)
      //Render in html
      const $newTaskTemplate = $taskTemplate.clone();
      $newTaskTemplate.find(".content").text(taskContent);
      $newTaskTemplate.find("input").prop("name", taskId).prop("cheked", taskCompleted);
      //.on('click', App.toggleCompleted)
      if (taskCompleted) {
        $("#completedTaskList").empty()
        $("#completedTaskList").append($newTaskTemplate);
        $newTaskTemplate.show()
      } else {
        $("#taskList").empty()
        $("#taskList").append($newTaskTemplate);
        $newTaskTemplate.show()
      }
    }
  },

  render: async () => {
    if (App.loading) {
      return;
    }
    App.setLoading(true);
    $("#account").text(App.account);
    await App.renderTasks();
    App.setLoading(false);
  },
  setLoading: (boolean) => {
    App.loading = boolean;
    const loader = $("#loader");
    const content = $("#content");
    if (boolean) {
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
