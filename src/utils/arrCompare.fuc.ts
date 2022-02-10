export function arrCompare(arr1: any[], arr2: any[]): boolean { 
  let flag=true;
  for(const item of arr1){
    if(!arr2.includes(item)){
      // 如果arr1里有arr2不包含的元素，认为两个数组不相同
      flag=false;
    }
  }
  for(const item of arr2){
    if(!arr1.includes(item)){
      // 如果arr2里有arr1不包含的元素，认为两个数组不相同
      flag=false;
    }
  }
  return flag;
}