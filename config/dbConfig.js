var pgSql = {};
pgSql.user = 'pnsyngduvlprgv';
pgSql.password = '4c23cc3c08b1406faaf7f844ede51f6e68caf7641d634acff782e7f4f80ae29b';
pgSql.host = 'ec2-3-91-112-166.compute-1.amazonaws.com';
pgSql.dbname = 'dbloq6t907jser';
var smtp = {};
smtp.email = 'vinoth00658@gmail.com';
smtp.pwd = '';
module.exports = {
    'getPgSqlConnectionString' : function (){
        // return 'postgres://' + pgSql.user + ':' + pgSql.password + '@localhost:5432/' + pgSql.dbname
        return 'postgres://' + pgSql.user + ':' + pgSql.password + '@' + pgSql.host + ':5432/' + pgSql.dbname
    },
    'pgsql' : pgSql,
    'smtp' : smtp    
};

