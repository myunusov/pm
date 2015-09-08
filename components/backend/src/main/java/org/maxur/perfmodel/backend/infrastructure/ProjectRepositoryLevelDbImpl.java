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
import org.jvnet.hk2.annotations.Service;
import org.maxur.perfmodel.backend.domain.Project;
import org.maxur.perfmodel.backend.domain.Repository;
import org.maxur.perfmodel.backend.service.Benchmark;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import javax.inject.Named;
import java.io.*;
import java.util.Collection;
import java.util.HashSet;
import java.util.Optional;

import static java.lang.String.format;
import static org.iq80.leveldb.impl.Iq80DBFactory.*;
import static org.slf4j.LoggerFactory.getLogger;

/**
 * Level Db Implementation of Project Repository.
 *
 * @author myunusov
 * @version 1.0
 * @since <pre>30.08.2015</pre>
 */
@Service
public class ProjectRepositoryLevelDbImpl implements Repository<Project> {

    private static final org.slf4j.Logger LOGGER = getLogger(ProjectRepositoryLevelDbImpl.class);

    public static final String ROOT_PREFIX = "/";

    private DB db;

    @SuppressWarnings("unused")
    @Named("db.folderName")
    private String dbFolderName;

    @PostConstruct
    public void init() {
        initDb();
    }

    private void initDb() {
        if (db != null) {
            return;
        }
        final Options options = new Options();
        options.createIfMissing(true);
        try {
            db = factory.open(new File(dbFolderName), options);
            LOGGER.info("LevelDb Database is opened");
        } catch (IOException e) {
            LOGGER.error("LeveDb Database is not opened", e);
            throw new IllegalStateException("LeveDb Database is not opened", e);
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
    public Optional<Project> get(final String key) {
        try {
            return Optional.<Project>ofNullable(objectFrom(db.get(bytes(key))));
        } catch (IOException | ClassNotFoundException e) {
            LOGGER.error(format("Cannot find project by id '%s'", key), e);
            throw new IllegalStateException(format("Cannot find project by name '%s'", key));
        }
    }

    @Override
    @Benchmark
    public Collection<Project> findAll() {
        final Collection<Project> values = new HashSet<>();
        try (DBIterator iterator = db.iterator()) {
            for(iterator.seek(bytes(ROOT_PREFIX)); iterator.hasNext(); iterator.next()) {
                final String key = asString(iterator.peekNext().getKey());
                if (key.startsWith(ROOT_PREFIX)) {
                    final byte[] value = iterator.peekNext().getValue();
                    values.add(objectFrom(value));
                } else {
                    break;
                }
            }
        } catch (IOException | ClassNotFoundException e) {
            LOGGER.error("Cannot get all projects", e);
            throw new IllegalStateException("Cannot get all projects", e);
        }
        return values;
    }

    @Override
    @Benchmark
    public Optional<Project> findByName(final String name) {
        try {
            return Optional.<Project>ofNullable(objectFrom(db.get(bytes(fullName(name)))));
        } catch (IOException | ClassNotFoundException e) {
            LOGGER.error(format("Cannot find project by name '%s'", name), e);
            throw new IllegalStateException(format("Cannot find project by name '%s'", name));
        }
    }

    @Override
    @Benchmark
    public Project remove(final String key) {
        final Project project;
        try (WriteBatch batch = db.createWriteBatch()) {
            project = objectFrom(db.get(bytes(key)));
            db.delete(bytes(key));
            db.delete(bytes(fullName(project.getName())));
            db.write(batch);
        } catch (IOException | ClassNotFoundException e) {
            LOGGER.error(format("Cannot remove project '%s'", key), e);
            throw new IllegalStateException(format("Cannot remove project '%s'", key));
        }
        return project;
    }

    @Override
    @Benchmark
    public Project put(final Project value) {
        try (WriteBatch batch = db.createWriteBatch()) {
            final Project prevProject = objectFrom(db.get(bytes(value.getId())));
            final boolean mustBeRenamed = prevProject != null && !prevProject.getName().equals(value.getName());
            if (mustBeRenamed) {
                db.delete(bytes(fullName(prevProject.getName())));
            }
            db.put(bytes(value.getId()), bytesFrom(value));
            db.put(bytes(fullName(value.getName())), bytesFrom(value.brief()));
            db.write(batch);
        } catch (IOException | ClassNotFoundException e) {
            LOGGER.error("Cannot save project '%s'", value.getName(), e);
            throw new IllegalStateException(format("Cannot save project '%s'", value.getName()));
        }
        return value;
    }

    private String fullName(final String name) {
        return ROOT_PREFIX + name;
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

    public static <T> T objectFrom(final byte[] bytes) throws IOException, ClassNotFoundException {
        if (bytes == null) {
            return null;
        }
        try (ByteArrayInputStream bis = new ByteArrayInputStream(bytes); ObjectInput in = new ObjectInputStream(bis)) {
            //noinspection unchecked
            return (T) in.readObject();
        }
    }


}
