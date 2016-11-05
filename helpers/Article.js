class Article {
  static objectToArray(data) {
    const dataArray = [];
    const dataKeys = Object.keys(data);
    dataKeys.forEach((key) => {
      dataArray.push({
        number: key,
        article: data[key],
      });
    });
    return dataArray;
  }
}

module.exports = Article;
