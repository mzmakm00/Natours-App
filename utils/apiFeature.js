class APIFeatures{
    constructor(query , queryString){
            this.query = query;                     // MongoDB query Object
            this.queryString = queryString;         // Query string from the URL
        }
        filter(){
            const queryObj = {...this.queryString};
    
            const excludedFields = ['page','sort','limit','fields'];
            excludedFields.forEach(el => delete queryObj[el]);
         
        
            let queryStr = JSON.stringify(queryObj);
            queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`  ); 
            // console.log(JSON.parse(queryStr))
    
            // let query = Tour.find(JSON.parse(queryStr))
            
            this.query.find(JSON.parse(queryStr))             //?duration[lt]=5 only 1 result will
            return this;
        }
    
        sort(){
            if(this.queryString.sort)
            {
                const sortBy = this.queryString.sort.split(',').join(' ')
                this.query= this.query.sort(sortBy)
            }else{
                this.query = this.query.sort('-createdAt')                               // sort=-ratingsAverage
            }
            return this;
        }
        limitFields() {
            if(this.queryString.fields)
            {
                const fields = this.queryString.fields.split(',').join(' ')
                this.query = this.query.select(fields)                                       //  ?fields=name,duration
            }else{
                this.query = this.query.select('-__v')          // else part mean all data show except __v's row
            }
            return this
        }
        paginate() {
            const page = this.queryString.page * 1 || 1;
            const limit = this.queryString.limit * 1 || 100;
            const skip =  (page-1) * limit;
    
            this.query = this.query.skip(skip).limit(limit)    
    
            return this; // Return the instance for method chaining
        }
    
    }

    module.exports = APIFeatures;