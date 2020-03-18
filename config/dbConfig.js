var pgSql = {};
pgSql.user = 'postgres';
pgSql.password = 'vinoth';
pgSql.host = '127.0.0.1';
pgSql.dbname = 'food_factory';
var smtp = {};
smtp.email = 'vinoth00658@gmail.com';
smtp.pwd = '';
module.exports = {
    'getPgSqlConnectionString' : function (){
        return 'postgres://' + pgSql.user + ':' + pgSql.password + '@localhost:5432/' + pgSql.dbname
    },
    'pgsql' : pgSql,
    'smtp' : smtp    
};

