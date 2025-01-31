require("dotenv").config();

//Default values for API Calls
process.env.API_URL = process.env.API_URL || 'https://api.faforever.com';
process.env.WP_URL = process.env.WP_URL || 'https:direct.faforever.com';

const fs = require('fs');
const axios = require('axios');

let d = new Date();
let timeFilter = 12;
let minusTimeFilter = d.setMonth(d.getMonth() - timeFilter);
let currentDate = new Date(minusTimeFilter).toISOString();


//TODO: Manage to make a loop of sorts of the URLs and "let data = dataObjectToArray.map" because it repeats alot and it could be done in a for loop/array since almost all API calls below have an extremely similar syntax/behavior.

async function getTournamentNews() {

  try {
    let response = await axios.get(`${process.env.WP_URL}/wp-json/wp/v2/posts/?per_page=10&_embed&_fields=content.rendered,categories&categories=638`);
    //Now we get a js array rather than a js object. Otherwise we can't sort it out.
    let dataObjectToArray = Object.values(response.data);
    
    let sortedData = dataObjectToArray.map(item => ({
      content: item.content.rendered,
      category: item.categories
    }));
    let newshubData = sortedData.filter(article => article.category[1] !== 284);
    return await newshubData;
  } catch (e) {
    console.log(e);
    return null;
  }
}


async function flashMessage() {

  try {
    let response = await axios.get(`${process.env.WP_URL}/wp-json/wp/v2/posts/?per_page=100&_embed&_fields,_links.wp:featuredmedia,_embedded,title,content.rendered,categories&categories=640`);
    
    //Now we get a js array rather than a js object. Otherwise we can't sort it out.
    let dataObjectToArray = Object.values(response.data);
    let data = dataObjectToArray.map(item => ({
      //title: item.title.rendered,
      content: item.newshub_badge,
      color: item.newshub_backgroundcolor,
      valid: item.newshub_sortIndex,
      pages: item.newshub_externalLinkUrl,

    }));
    return await data;
  } catch (e) {
    console.log(e);
    return null;
  }
}

async function news() {
  try {
    let response = await axios.get(`${process.env.WP_URL}/wp-json/wp/v2/posts/?per_page=100&_embed&_fields=_links.author,_links.wp:featuredmedia,_embedded,title,content.rendered,date,categories&categories=587`);
    
    //Now we get a js array rather than a js object. Otherwise we can't sort it out.
    let dataObjectToArray = Object.values(response.data);
    let data = dataObjectToArray.map(item => ({
      date: item.date,
      title: item.title.rendered,
      content: item.content.rendered,
      author: item._embedded.author[0].name,
      media: item._embedded['wp:featuredmedia'][0].source_url,
    }));
    return await data;
  } catch (e) {
    console.log(e);
    return null;
  }
}

async function newshub() {

  try {
    let response = await axios.get(`${process.env.WP_URL}/wp-json/wp/v2/posts/?per_page=10&_embed&_fields=_links.author,_links.wp:featuredmedia,_embedded,title,newshub_externalLinkUrl,newshub_sortIndex,content.rendered,date,categories&categories=283`);
    
    let dataObjectToArray = await Object.values(response.data);
    let sortedData = await dataObjectToArray.map(item => ({
      category: item.categories,
      sortIndex: item.newshub_sortIndex,
      link: item.newshub_externalLinkUrl,
      date: item.date,
      title: item.title.rendered,
      content: item.content.rendered,
      author: item._embedded.author[0].name,
      media: item._embedded['wp:featuredmedia'][0].source_url,
    }));
    sortedData.sort((articleA, articleB) => articleB.sortIndex - articleA.sortIndex);

    function onlyActiveArticles(article) {
      return article.category[1] !== 284;
    }

    let data = sortedData.filter(onlyActiveArticles);
    return await data;
  } catch (e) {
    console.log(e);
    return null;
  }
}


async function fafTeams() {

  try {
    let response = await axios.get(`${process.env.WP_URL}/wp-json/wp/v2/posts/?per_page=100&_embed&_fields=content.rendered,categories&categories=636`);
    
    let dataObjectToArray = Object.values(response.data);
    let data = dataObjectToArray.map(item => ({
      content: item.content.rendered,
    }));
    return await data;
  } catch (e) {
    console.log(e);
    return null;
  }

}

async function contentCreators() {
  try {
    let response = await axios.get(`${process.env.WP_URL}/wp-json/wp/v2/posts/?per_page=100&_embed&_fields=content.rendered,categories&categories=639`);
    
    let dataObjectToArray = Object.values(response.data);
    let data = dataObjectToArray.map(item => ({
      content: item.content.rendered,
    }));
    return await data;
  } catch (e) {
    console.log(e);
    return null;
  }


}

async function getAllClans() {
  try {
    let response = await axios.get(`${process.env.API_URL}/data/clan?sort=createTime&include=leader&fields[clan]=name,tag,description,leader,memberships,createTime&fields[player]=login&page[number]=1&page[size]=3000`);
    
    let dataObjectToArray = Object.values(response.data);
    let clanLeader = dataObjectToArray[2].map(item => ({
      leaderName: item.attributes.login
    }));
    let clanValues = dataObjectToArray[0].map(item => ({
      //id: item.id,
      name: item.attributes.name,
      tag: item.attributes.tag,
      createTime: item.attributes.createTime,
      //description: item.attributes.description,
      population: item.relationships.memberships.data.length
    }));
    const combineArrays = (array1, array2) => array1.map((x, i) => [x, array2[i]]);
    let clanData = combineArrays(clanLeader, clanValues);
    clanData.sort((playerA, playerB) => playerA[1].population - playerB[1].population);
    return await clanData;

  } catch (e) {
    console.log(e);
    return null;
  }

}


async function getLeaderboards(leaderboardID) {
  try {
    let response = await axios.get(`${process.env.API_URL}/data/leaderboardRating?include=player&sort=-rating&filter=leaderboard.id==${leaderboardID};updateTime=ge=${currentDate}&page[size]=9999`);


    let dataObjectToArray = await Object.values(response.data);

    let playerLogin = dataObjectToArray[2].map(item => ({
      label: item.attributes.login
    }));
    let playerValues = dataObjectToArray[0].map(item => ({
      rating: item.attributes.rating,
      totalgames: item.attributes.totalGames,
      wonGames: item.attributes.wonGames,
      date: item.attributes.updateTime,
    }));
    const combineArrays = (array1, array2) => array1.map((x, i) => [x, array2[i]]);
    let leaderboardData = combineArrays(playerLogin, playerValues);
    leaderboardData.sort((playerA, playerB) =>  playerB[1].rating - playerA[1].rating);
    return await leaderboardData;
    
  } catch (e) {
    console.log(e);
    return null;

  }
}

module.exports.run = function run() {

  // Do not change the order of these/make sure they match the order of fileNames below
  const extractorFunctions = [
    getTournamentNews(), flashMessage(), news(), contentCreators(), newshub(), fafTeams(), getAllClans(),
    getLeaderboards(1), getLeaderboards(2), getLeaderboards(3), getLeaderboards(4),
  ];
  //Make sure to not change the order of these since they match the order of extractorFunctions
  const fileNames = [
    'tournament-news','flashMessage', 'news', 'content-creators', 'newshub', 'faf-teams', 'getAllClans',
    'global', '1v1', '2v2', '4v4',
  ];

  fileNames.forEach((fileName, index) => {
    extractorFunctions[index]
      .then(data => {
        fs.writeFile(`public/js/app/members/${fileName}.json`, JSON.stringify(data), error => {
          if (error) {
            console.log(error);
          } else {
            console.log(`${currentDate} - ${fileName} file created.`);
          }
        });
      });
  });
};


