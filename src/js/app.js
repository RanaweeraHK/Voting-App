App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      web3 = new Web3(window.ethereum);
      try {
        // Request account access if needed
        window.ethereum.enable();
        // Accounts now exposed
      } catch (error) {
        // User denied account access...
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
      web3 = new Web3(window.web3.currentProvider);
    }
    // If no injected web3 instance is detected, fall back to a public network
    else {
      // Use Infura for Sepolia testnet instead of localhost
      App.web3Provider = new Web3.providers.HttpProvider('https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID');
      web3 = new Web3(App.web3Provider);
      alert("Please install MetaMask to use this dApp with your own account!");
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("Election.json", function(election) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Election = TruffleContract(election);
      // Connect provider to interact with contract
      App.contracts.Election.setProvider(App.web3Provider);

      // Try to get accounts directly after setting up the contract
      web3.eth.getAccounts(function(err, accs) {
        if (err != null) {
          alert("There was an error fetching your accounts.");
          return;
        }

        if (accs.length == 0) {
          alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
          return;
        }

        App.account = accs[0];
      });

      App.listenForEvents();

      return App.render();
    });
  },

  listenForEvents: function() {
    App.contracts.Election.deployed().then(function(instance) {
      // Use the older .watch() method which is compatible with this version of web3
      instance.votedEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        // Reload when a new vote is recorded
        App.render();
      });
    });
  },

  render: function() {
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Load account data - try multiple methods to get the account
    try {
      // Method 1: getAccounts (newer web3)
      web3.eth.getAccounts(function(err, accounts) {
        if (err === null && accounts && accounts.length > 0) {
          App.account = accounts[0];
          $("#accountAddress").html("Your Account: " + accounts[0]);
        } else {
          // Method 2: getCoinbase (older web3)
          web3.eth.getCoinbase(function(err, account) {
            if (err === null && account) {
              App.account = account;
              $("#accountAddress").html("Your Account: " + account);
            } else {
              // Method 3: accounts (direct property)
              if (web3.eth.accounts && web3.eth.accounts.length > 0) {
                App.account = web3.eth.accounts[0];
                $("#accountAddress").html("Your Account: " + web3.eth.accounts[0]);
              } else {
                // Fallback to default account
                $("#accountAddress").html("Could not detect your account. Please check your wallet connection.");
              }
            }
          });
        }
      });
    } catch (e) {
      // Fallback to direct accounts property if methods fail
      if (web3.eth.accounts && web3.eth.accounts.length > 0) {
        App.account = web3.eth.accounts[0];
        $("#accountAddress").html("Your Account: " + web3.eth.accounts[0]);
      } else {
        $("#accountAddress").html("Could not detect your account. Please check your wallet connection.");
      }
    }

    // Load contract data
    App.contracts.Election.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance.candidatesCount();
    }).then(function(candidatesCount) {
      var candidatesResults = $("#candidatesResults");
      candidatesResults.empty();

      var candidatesSelect = $('#candidatesSelect');
      candidatesSelect.empty();

      for (var i = 1; i <= candidatesCount; i++) {
        electionInstance.candidates(i).then(function(candidate) {
          var id = candidate[0];
          var name = candidate[1];
          var voteCount = candidate[2];

          // Render candidate Result
          var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>";
          candidatesResults.append(candidateTemplate);

          // Render candidate ballot option
          var candidateOption = "<option value='" + id + "'>" + name + "</option>";
          candidatesSelect.append(candidateOption);
        });
      }
      return electionInstance.voters(App.account);
    }).then(function(hasVoted) {
      // Do not allow a user to vote
      if(hasVoted) {
        $('form').hide();
      }
      loader.hide();
      content.show();
    }).catch(function(error) {
      // Show error message but still display the content
      loader.hide();
      content.show();
      $("#candidatesResults").html("<tr><td colspan='3'>Could not load candidates. Please make sure you're connected to the correct Ethereum network in MetaMask.</td></tr>");
      $("#accountAddress").html("Network Error: Please connect MetaMask to the correct network where the contract is deployed.");
    });
  },

  castVote: function() {
    var candidateId = $('#candidatesSelect').val();
    var loader = $("#loader");
    var content = $("#content");

    App.contracts.Election.deployed().then(function(instance) {
      return instance.vote(candidateId, { from: App.account });
    }).then(function(result) {
      // Wait for votes to update
      content.hide();
      loader.show();
    }).catch(function(error) {
      loader.html("Could not cast vote");
    });
  }
};

$(function() {
  $(document).ready(function() {
    App.init();
  });
});
