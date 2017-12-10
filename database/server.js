var express=require("express")
var Sequelize=require("sequelize")
var nodeadmin=require("nodeadmin")
var connection=new Sequelize('myproject','root','', {
    dialect:'mysql',
    host:'localhost'
})

connection.authenticate().then(function(){
    console.log('Great!')
})

var Candidates=connection.define('candidates',{
    id: Sequelize.INTEGER,
    name: Sequelize.STRING,
    surname: Sequelize.STRING,
    mail: Sequelize.STRING,
    team_id: Sequelize.INTEGER,
    company_id: Sequelize.INTEGER,
    qualification_id: Sequelize.INTEGER
})

var Qualifications=connection.define('qualifications',{
    id: Sequelize.INTEGER,
    skills: Sequelize.STRING,
    experience: Sequelize.INTEGER
})

var Teams=connection.define('teams',{
    id: Sequelize.INTEGER,
    leader_name: Sequelize.STRING,
    project_name: Sequelize.STRING
})

var Companies=connection.define('companies',{
    id: Sequelize.INTEGER,
    name: Sequelize.STRING,
    country: Sequelize.STRING
})

var Departments=connection.define('departments',{
    id: Sequelize.INTEGER,
    name: Sequelize.STRING,
    company_id: Sequelize.INTEGER
})

Candidates.belongsTo(Teams,{foreignKey:'team_id',targetKey:'id'});

Candidates.belongsTo(Qualifications,{foreignKey:'qualification_id',targetKey:'id'});

Candidates.belongsTo(Companies,{foreignKey:'company_id',targetKey:'id'});

Departments.belongsTo(Companies,{foreignKey:'company_id',targetKey:'id'});

var app=express()
app.use('/nodeadmin',nodeadmin(app))

app.use(express.static('public'))
app.use('/admin',express.static('admin'))

app.get('/candidates',function(request,response){
    Candidates.findAll(
        {
            include:[{
                model:Teams,
                where:{id:Sequelize.col('candidates.team_id')}
            }],
            include:[{
                model:Qualifications,
                where:{id:Sequelize.col('candidates.qualification_id')}
            }],
            include:[{
                model:Companies,
                where:{id:Sequelize.col('candidates.company_id')}
            }]
        }).then(function(candidate){
        response.status(200).send(candidate)
    })
})

app.get('/departments',function(request,response){
    Departments.findById({
        include:[{
            model:Companies,
            where:{id:Sequelize.col('departments.company_id')}
        }]
    })
})


app.post('/teams',function(request,response){
    Teams.create(request.body).then(function(team){
        response.status(201).send(team)
    })
})

app.put('/qualifications/:experience',function(request,response){
    Qualifications.findById(request.params.id).then(function(qualification){
        if(qualification){
            qualification.update(request.body).then(function(qualification){
                response.status(201).send(qualification)
            }).catch(function(error){
                response.status(200).send(error)
            })
        }
        else{
            response.status(404).send('data not found')
        }
    })
})

app.delete('/candidates/:id',function(request,response){
    Candidates.findById(request.params.id).then(function(candidate){
        if(candidate){
            candidate.destroy().then(function(){
                response.status(204).send(candidate)
            })
        }
        else
        {
            response.status(404).send('id not found')
        }
    })
})


app.listen(8080)