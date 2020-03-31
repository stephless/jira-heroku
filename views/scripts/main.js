var root = document.getElementById("body")
const proxyurl = "https://cors-anywhere.herokuapp.com/";
var jql = "project=PS%20AND%20assignee=%22stephen%20leslie%22%20AND%20issuetype=Epic%20AND%20status!=done%20AND%20status!=declined%20AND%20status!=%22customer%20declined%22+order+by+summary"
var fields = "id,summary,status,customfield_10700,description"
//var url = "https://sharpspring.atlassian.net/rest/api/latest/search?jql=" + jql + "&fields=" + fields
var epicUrl ="/jsons/epics.json"    //https://sharpspring.atlassian.net/rest/api/latest/search?jql=project=PS%20AND%20assignee=%22stephen%20leslie%22%20AND%20issuetype=Epic%20AND%20status!=done%20AND%20status!=declined%20AND%20status!=%22customer%20declined%22+order+by+summary&fields=id,summary,colorName
var issueUrl = "/jsons/issues.json" //https://sharpspring.atlassian.net/rest/api/latest/search?jql=issuetype=%22integration%20task%22%20AND%20reporter=%22stephen%20leslie%22%20AND%20status!=Done%20AND%20status!=Declined%20AND%20status!=%22Customer%20Declined%22&fields=summary,id,key,reporter,customfield_10007,duedate,status,description&maxResults=100
var flagUrl = "/jsons/flags.json" //
var browse = "https://sharpspring.atlassian.net/browse/"

var flagData

var myHeaders = new Headers();
myHeaders.append("Authorization", "Basic c3RlcGhlbi5sZXNsaWVAc2hhcnBzcHJpbmcuY29tOmZkYWZtZjhFenczdXNLMkttSzd0MzIyQQ==");

var requestOptions = {
  method: 'GET',
  headers: myHeaders,
  redirect: 'follow'
};

function ProcessEpics(result){
  var data = JSON.parse(result)
  console.log(data)
  body.innerHTML = "";
  for (i = 0; i < data.issues.length; i++){
    var summary = data.issues[i].fields.summary
    var accountNumber = summary.split(" ")
    accountNumber = accountNumber[accountNumber.length - 2]
    var key = data.issues[i].key
    var am = data.issues[i].fields.customfield_10700[0].displayName
    var desc = data.issues[i].fields.description
    var status = data.issues[i].fields.status.name
    var issueCard = document.createElement('div')
    var issueList = document.createElement('ul')
    issueList.id = key +"_list"
    issueCard.id = key
    issueCard.classList.add('card')
    var issueLink = document.createElement('a')
    var issueStatus = document.createElement('span')
    var issueAm = document.createElement('span')
    var issueDetails = document.createElement('div')
    var issueSummary = document.createElement('h2')
    var issueDescription = document.createElement('p')
    issueCard.setAttribute('accountNumber',accountNumber)

    issueLink.href = browse + key
    issueLink.textContent = summary;
    issueDescription.textContent = desc;
    issueAm.textContent = am;
    issueStatus.textContent = status;

    issueDetails.classList.add('details')
    issueDetails.id = ( key +'_details')

    root.appendChild(issueCard)
    issueSummary.appendChild(issueLink)
    issueSummary.appendChild(issueStatus)
    issueSummary.appendChild(issueAm)

    issueCard.appendChild(issueSummary)
    issueCard.appendChild(issueDetails)
    issueDetails.appendChild(issueDescription)
    issueDetails.appendChild(issueList)



    status = status.replace(/\s+/g, '');
    issueSummary.classList.add(status)
    ProcessFlags(accountNumber, issueSummary);
    var issueToggle = document.createElement('button')
    issueToggle.classList.add('arrow')
    issueToggle.id = (key + '_arrow')
    issueSummary.appendChild(issueToggle)

  }
  GetSubIssue()
}

function ProcessFlags(accNum, sum){
    if (flagData[accNum] != undefined){
      var isIntegrated = flagData[accNum].isIntegrated;
      var binaryCount = flagData[accNum].BinaryCount;
      var mantatory = flagData[accNum].Mantatory;
      flagDescription = document.createElement('span')
      flagDescription.textContent = isIntegrated + "- M:" + mantatory  +"/4, T: " + binaryCount
      sum.appendChild(flagDescription)
    }
    else{
      flagDescription = document.createElement('span')
      flagDescription.textContent = "N/A"
      sum.appendChild(flagDescription)
    }
    return;
}

function ProcessIssues(result){
    var subData = JSON.parse(result);
    console.log(subData)
    for (i = 0; i < subData.issues.length; i++){
      var subSummary = subData.issues[i].fields.summary
      var subKey = subData.issues[i].key
      var subStatus = subData.issues[i].fields.status.name
      var subDue = subData.issues[i].fields.duedate || "no due date"
      var subDescription = subData.issues[i].fields.description || ""
      var subEpic = subData.issues[i].fields.customfield_10007;

      var myCard = document.getElementById(subEpic)

      var mySubList = document.getElementById(subEpic + "_list")
      var subItem = document.createElement('li')
      var subA = document.createElement('a')
      var subInfo = document.createElement('p')

      subInfo.textContent = "( " + subDue + " ) " + subDescription

      subA.textContent = subSummary
      subA.href = browse + subKey
      subA.classList.add('subIssue')
      subA.classList.add(subStatus)

      mySubList.appendChild(subItem)
      subItem.appendChild(subA)
      subItem.appendChild(subInfo)
    }
  CreateArrows();
}

function CreateArrows(){
  allArrows = document.getElementsByClassName('arrow')

  for(a = 0; a< allArrows.length; a++){
    allArrows[a].setAttribute('onClick','ToggleDetails(this.id)')

  }
}

function ToggleDetails(id){
  me = document.getElementById(id)
  detailString = "_details"
  arrowsString = "_arrows"
    myIssueId = me.id.substring(0,arrowsString.length)
    myDetails = document.getElementById(myIssueId + detailString)
    console.log(myIssueId + detailString)
    myDetails.classList.toggle('show')
    me.classList.toggle('show')
}

function GetSubIssue(){
  var mySubHeaders = new Headers();
  mySubHeaders.append("Authorization", "Basic c3RlcGhlbi5sZXNsaWVAc2hhcnBzcHJpbmcuY29tOmZkYWZtZjhFenczdXNLMkttSzd0MzIyQQ==");
  mySubHeaders.append("Cookie", "atlassian.xsrf.token=B0LB-UWBE-EMNK-8SQ3_f8a9d6d866c31c46ea04ca50e2c8fa0f893ce3b9_lin");

  var subRequestOptions = {
    method: 'GET',
    headers: mySubHeaders,
    redirect: 'follow'
  };

  fetch(issueUrl/*proxyurl + "https://sharpspring.atlassian.net/rest/api/latest/issue/" + subKey + "?fields=key,summary,duedate,status,description,customfield_10007", subRequestOptions*/)
    .then(response => response.text())
    .then(result => ProcessIssues(result))
    .catch(error => console.log('error', error))
}

var myFlagHeaders = new Headers();
myFlagHeaders.append("Authorization", "Basic c3RlcGhlbi5sZXNsaWVAc2hhcnBzcHJpbmcuY29tOmZkYWZtZjhFenczdXNLMkttSzd0MzIyQQ==");
myFlagHeaders.append("Cookie", "atlassian.xsrf.token=B0LB-UWBE-EMNK-8SQ3_f8a9d6d866c31c46ea04ca50e2c8fa0f893ce3b9_lin");

var flagRequestOptions = {
  method: 'GET',
  headers: myFlagHeaders,
  redirect: 'follow'
};

fetch(flagUrl/*proxyurl + "https://sharpspring.atlassian.net/rest/api/latest/issue/" + subKey + "?fields=key,summary,duedate,status,description,customfield_10007", subRequestOptions*/)
  .then(response => response.text())
  .then(result => {
    console.log("flags success")
    flagData = JSON.parse(result);
  })
  .catch(error => console.log('error', error))




fetch(epicUrl/*proxyurl + url*/, requestOptions)
  .then(response => response.text())
  .then(result => ProcessEpics(result))
  .catch(error => console.log('error', error));
