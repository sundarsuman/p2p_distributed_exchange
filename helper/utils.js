
module.exports = {
  insertSortedAsc: function (levels, order) {
    let l = 0
    let r = levels.length - 1
  
    while (l <= r) {
      let m = Math.floor((l+r)/2);
  
      if (levels[m].limit_price == order.limit_price) {
        levels.splice(m + 1, 0, order);
        return levels;
      } else if (levels[m].limit_price < order.limit_price ) {
        l = m + 1
      } else {
        r = m -1 
      }
    }
    
    levels.splice(l, 0, order)
    return levels
  },
  
  insertSortedDesc: function (levels, order) {
    let l = 0
    let r = levels.length - 1
  
    while (l <= r) {
      let m = Math.floor((l+r)/2);
  
      if (levels[m].limit_price == order.limit_price) {
        levels.splice(m + 1, 0, order);
        return levels;
      } else if (levels[m].limit_price > order.limit_price ) {
        l = m + 1
      } else {
        r = m -1 
      }
    }
    
    levels.splice(l, 0, order)
    return levels
  }
}