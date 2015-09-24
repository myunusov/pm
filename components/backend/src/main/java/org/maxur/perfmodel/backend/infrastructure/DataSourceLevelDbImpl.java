/*
 * Copyright (c) 2015 Maxim Yunusov
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

package org.maxur.perfmodel.backend.infrastructure;

import org.iq80.leveldb.DB;
import org.iq80.leveldb.DBIterator;
import org.iq80.leveldb.Options;
import org.iq80.leveldb.WriteBatch;
import org.iq80.leveldb.impl.Iq80DBFactory;
import org.maxur.perfmodel.backend.service.Benchmark;
import org.maxur.perfmodel.backend.service.DataSource;
import org.maxur.perfmodel.backend.service.Database;
import org.slf4j.Logger;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import javax.inject.Named;
import java.io.*;
import java.util.Collection;
import java.util.HashSet;
import java.util.Optional;

import static org.iq80.leveldb.impl.Iq80DBFactory.asString;
import static org.iq80.leveldb.impl.Iq80DBFactory.bytes;
import static org.slf4j.LoggerFactory.getLogger;

public class DataSourceLevelDbImpl implements DataSource, Database {

    private static final Logger LOGGER = getLogger(DataSourceLevelDbImpl.class);

    private DB db;

    @SuppressWarnings("unused")
    @Named("db.folderName")
    private String dbFolderName;

    @Override
    @PostConstruct
    public void init() {
        if (db != null) {
            return;
        }
        final Options options = new Options();
        options.createIfMissing(true);
        try {
            final Iq80DBFactory factory = Iq80DBFactory.factory;
            db = factory.open(new File(dbFolderName), options);
            LOGGER.info("LevelDb Database ({}) is opened", factory.toString());
        } catch (IOException e) {
            final String msg = "LevelDb Database is not opened";
            LOGGER.error(msg, e);
            throw new IllegalStateException(msg, e);
        }
    }

    @Override
    @PreDestroy
    public void stop() {
        try {
            db.close();
            LOGGER.info("LevelDb Database is closed now");
        } catch (IOException e) {
            LOGGER.error("LevelDb Database is not closed", e);
        }
    }

    @Override
    @Benchmark
    public <T> Optional<T> get(final String key) throws IOException, ClassNotFoundException {
        return Optional.<T>ofNullable(objectFrom(db.get(bytes(key))));
    }

    @Override
    @Benchmark
    public <T> Collection<T> findAllByPrefix(final String prefix) throws IOException, ClassNotFoundException {
        final Collection<T> values = new HashSet<>();
        try (DBIterator iterator = db.iterator()) {
            for (iterator.seek(bytes(prefix)); iterator.hasNext(); iterator.next()) {
                final String key = asString(iterator.peekNext().getKey());
                if (!key.startsWith(prefix)) {
                    break;
                }
                final byte[] value = iterator.peekNext().getValue();
                values.add(objectFrom(value));
            }
        }
        return values;
    }

    @Override
    @Benchmark
    public void delete(String key) {
        db.delete(bytes(key));
    }

    @Override
    @Benchmark
    public WriteBatch createWriteBatch() {
        return db.createWriteBatch();
    }

    @Override
    @Benchmark
    public void commit(WriteBatch batch) {
        db.write(batch);
    }

    @Override
    @Benchmark
    public void put(final String key, final Serializable value) throws IOException {
        db.put(bytes(key), bytesFrom(value));
    }

    private static <T> T objectFrom(final byte[] bytes) throws IOException, ClassNotFoundException {
        if (bytes == null) {
            return null;
        }
        try (ByteArrayInputStream bis = new ByteArrayInputStream(bytes); ObjectInput in = new ObjectInputStream(bis)) {
            //noinspection unchecked
            return (T) in.readObject();
        }
    }


    public static byte[] bytesFrom(final Serializable object) throws IOException {
        if (object == null) {
            return null;
        }
        try (
                ByteArrayOutputStream bos = new ByteArrayOutputStream();
                ObjectOutput out = new ObjectOutputStream(bos)
        ) {
            out.writeObject(object);
            return bos.toByteArray();
        }
    }

}