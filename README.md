# import-testing

Experimenting with batch mutations with Prisma

## Introduction

Update: check https://github.com/graphcool/prisma/issues/2060

Based on https://github.com/graphcool/prisma/issues/1788, I started to play around with hammering Prisma services with a lot of HTTP requests. During my experiments, I found out that using nested mutations, it's super easy to run into "Caused by: java.sql.SQLException: Deadlock found when trying to get lock; try restarting transaction" exceptions.

Note that this error is only reproducible against the local cluster. It is not reproducible against eu1.

I don't know if the error I encounter is the underlying issue for the referenced bug report on Github.

## Reproduction

```
npm install -g prisma
prisma local upgrade # I tested with `prisma@1.1.2` and Docker image `1.1.0`
npm install
prisma deploy
yarn start # reproduces error
prisma local logs > test.txt # save logs
prisma reset
yarn start-works # works, because we don't use nested mutations
```

## Error message

```
prisma-database_1  | java.sql.SQLTransactionRollbackException: (conn=164) Deadlock found when trying to get lock; try restarting transaction
prisma-database_1  |    at org.mariadb.jdbc.internal.util.exceptions.ExceptionMapper.get(ExceptionMapper.java:165)
prisma-database_1  |    at org.mariadb.jdbc.internal.util.exceptions.ExceptionMapper.getException(ExceptionMapper.java:106)
prisma-database_1  |    at org.mariadb.jdbc.MariaDbStatement.executeExceptionEpilogue(MariaDbStatement.java:235)
prisma-database_1  |    at org.mariadb.jdbc.MariaDbPreparedStatementClient.executeInternal(MariaDbPreparedStatementClient.java:224)
prisma-database_1  |    at org.mariadb.jdbc.MariaDbPreparedStatementClient.execute(MariaDbPreparedStatementClient.java:159)
prisma-database_1  |    at com.zaxxer.hikari.pool.ProxyPreparedStatement.execute(ProxyPreparedStatement.java:44)
prisma-database_1  |    at com.zaxxer.hikari.pool.HikariProxyPreparedStatement.execute(HikariProxyPreparedStatement.java)
prisma-database_1  |    at slick.jdbc.StatementInvoker.results(StatementInvoker.scala:39)
prisma-database_1  |    at slick.jdbc.StatementInvoker.iteratorTo(StatementInvoker.scala:22)
prisma-database_1  |    at slick.jdbc.Invoker.first(Invoker.scala:31)
prisma-database_1  |    at slick.jdbc.Invoker.first$(Invoker.scala:30)
prisma-database_1  |    at slick.jdbc.StatementInvoker.first(StatementInvoker.scala:16)
prisma-database_1  |    at slick.jdbc.StreamingInvokerAction$HeadAction.run(StreamingInvokerAction.scala:52)
prisma-database_1  |    at slick.jdbc.StreamingInvokerAction$HeadAction.run(StreamingInvokerAction.scala:51)
prisma-database_1  |    at slick.dbio.DBIOAction$$anon$4.$anonfun$run$3(DBIOAction.scala:240)
prisma-database_1  |    at scala.collection.Iterator.foreach(Iterator.scala:929)prisma-database_1  |    at scala.collection.Iterator.foreach$(Iterator.scala:929)
prisma-database_1  |    at scala.collection.AbstractIterator.foreach(Iterator.scala:1417)
prisma-database_1  |    at scala.collection.IterableLike.foreach(IterableLike.scala:71)
prisma-database_1  |    at scala.collection.IterableLike.foreach$(IterableLike.scala:70)
prisma-database_1  |    at scala.collection.AbstractIterable.foreach(Iterable.scala:54)
prisma-database_1  |    at slick.dbio.DBIOAction$$anon$4.run(DBIOAction.scala:240)
prisma-database_1  |    at slick.dbio.DBIOAction$$anon$4.run(DBIOAction.scala:238)
prisma-database_1  |    at slick.dbio.DBIOAction$$anon$4.$anonfun$run$3(DBIOAction.scala:240)
prisma-database_1  |    at scala.collection.Iterator.foreach(Iterator.scala:929)prisma-database_1  |    at scala.collection.Iterator.foreach$(Iterator.scala:929)
prisma-database_1  |    at scala.collection.AbstractIterator.foreach(Iterator.scala:1417)
prisma-database_1  |    at scala.collection.IterableLike.foreach(IterableLike.scala:71)
prisma-database_1  |    at scala.collection.IterableLike.foreach$(IterableLike.scala:70)
prisma-database_1  |    at scala.collection.AbstractIterable.foreach(Iterable.scala:54)
prisma-database_1  |    at slick.dbio.DBIOAction$$anon$4.run(DBIOAction.scala:240)
prisma-database_1  |    at slick.dbio.DBIOAction$$anon$4.run(DBIOAction.scala:238)
prisma-database_1  |    at slick.dbio.SynchronousDatabaseAction$FusedAndThenAction.$anonfun$run$4(DBIOAction.scala:534)
prisma-database_1  |    at slick.dbio.SynchronousDatabaseAction$FusedAndThenAction.$anonfun$run$4$adapted(DBIOAction.scala:534)
prisma-database_1  |    at scala.collection.Iterator.foreach(Iterator.scala:929)prisma-database_1  |    at scala.collection.Iterator.foreach$(Iterator.scala:929)
prisma-database_1  |    at scala.collection.AbstractIterator.foreach(Iterator.scala:1417)
prisma-database_1  | {"@timestamp":"2018-01-31T22:08:50.089+00:00","@version":1,"message":"{\"key\":\"request/new\",\"requestId\":\"api:api:cjd3mj44p0ati0120jbq
4k8xf\"}","logger_name":"com.prisma.api.server.ApiServer","thread_name":"single-server-akka.actor.default-dispatcher-4","level":"INFO","level_value":20000,"HOST
NAME":"95d5b2fb32e2"}
prisma-database_1  |    at scala.collection.IterableLike.foreach(IterableLike.scala:71)
prisma-database_1  |    at scala.collection.IterableLike.foreach$(IterableLike.scala:70)
prisma-database_1  |    at scala.collection.AbstractIterable.foreach(Iterable.scala:54)
prisma-database_1  |    at slick.dbio.SynchronousDatabaseAction$FusedAndThenAction.run(DBIOAction.scala:534)
prisma-database_1  |    at slick.dbio.SynchronousDatabaseAction$$anon$11.run(DBIOAction.scala:571)
prisma-database_1  |    at slick.basic.BasicBackend$DatabaseDef$$anon$2.liftedTree1$1(BasicBackend.scala:240)
prisma-database_1  |    at slick.basic.BasicBackend$DatabaseDef$$anon$2.run(BasicBackend.scala:240)
prisma-database_1  |    at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149)
prisma-database_1  |    at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
prisma-database_1  |    at java.lang.Thread.run(Thread.java:748)
prisma-database_1  | Caused by: java.sql.SQLException: Deadlock found when trying to get lock; try restarting transaction
prisma-database_1  | Query is: insert into `benchmark@dev`.`_ArticleToSource` (`id`, `A`, `B`)
prisma-database_1  |            Select 'cjd3mj44b0atf012047wa8gjf', (select id from `benchmark@dev`.`Article` where `id` = ?), `id`
prisma-database_1  |            FROM `benchmark@dev`.`Source` where `slug` = ? on duplicate key update `benchmark@dev`.`_ArticleToSource`.id=`benchmark@dev`.`_A
rticleToSource`.id, parameters ['cjd3mj44a0ata0120dwlzt1n2','test']
prisma-database_1  |    at org.mariadb.jdbc.internal.util.LogQueryTool.exceptionWithQuery(LogQueryTool.java:146)
prisma-database_1  |    at org.mariadb.jdbc.internal.protocol.AbstractQueryProtocol.executeQuery(AbstractQueryProtocol.java:217)
prisma-database_1  |    at org.mariadb.jdbc.MariaDbPreparedStatementClient.executeInternal(MariaDbPreparedStatementClient.java:218)
prisma-database_1  |    ... 43 more
```
