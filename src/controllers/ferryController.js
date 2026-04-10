const ferry = require('./models/ferry');

const  createFerry = (req,res) => {
const{ name, vehicle_capacity, passenger_capacity, image_url, amenities } = req.body;
ferry.createFerry({name,vehical_capacity,passenger_capicity,image_url,amentities},(err,result) =>{
    if(err){
        return res.status(500).json({message:'Error creating ferry'});
    }
    res.status(201).json({message:'New ferry created successfully'})
});
};

