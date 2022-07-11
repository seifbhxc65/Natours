
class Apifeatures{
    constructor(query,queryStr){
       console.log(queryStr);
      this.query=query
      this.queryStr=queryStr
    }
    filtering(){
       console.log('filering');
      //1)Basic filtering 
      const excludedFields=['page','sort','limit','fields']
      const queryObj={...this.queryStr};
      excludedFields.forEach(ex=>delete queryObj[ex])
     
      //2) Advanced filtering
      
      const queryStr=JSON.stringify(queryObj)
                    .replace(/\b(gte|gt|lte|lt)\b/g,
                    match=>`$${match}`)
                    
    
                   
      this.query= this.query.find(JSON.parse(queryStr) )
    
      return this;
    }
    sorting(){ 
      console.log('sorting');
      
      if(this.queryStr.sort){
        console.log(this.queryStr.sort);
        this.query=this.query.sort(this.queryStr.sort.split(',').join(' '))
      }
      else{this.query=this.query.sort('-createdAt')}
      return this;
    }
    limiting(){ 
      console.log('limiting');
      if(this.queryStr.fields){
        this.query=this.query
                  .select(this.queryStr.fields.split(',').join(' '))
      }else{
        this.query=this.query
                  .select('-__v')
      }
      return this;
    }
   pagination(){ 
    console.log('pagination');
      const page=(this.queryStr.page*1)||1
      console.log(`page : ${page}`);
      const limit=(this.queryStr.limit*1)||100
      console.log(`limit : ${limit}`);
      this.query=this.query
      .skip((page-1)*limit)
      .limit(limit)
      if(!this.query) throw new Error('what the fuck;,;=')
    //   if(this.queryStr.page){
    //     const numTours=await Tour.countDocuments()
    //     console.log(numTours+"  "+(page-1)*limit);
    //     if((page-1)*limit>numTours) throw new Error('this page does not exist')
    //   }
    
      return this;
    
    }
    
  }
  module.exports=Apifeatures