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

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.iq80.leveldb.DB;
import org.iq80.leveldb.Options;
import org.iq80.leveldb.WriteBatch;
import org.jvnet.hk2.annotations.Service;
import org.maxur.perfmodel.backend.domain.Project;
import org.maxur.perfmodel.backend.domain.Repository;
import org.maxur.perfmodel.backend.service.Benchmark;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import javax.inject.Named;
import java.io.File;
import java.io.IOException;
import java.util.Collection;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.stream.Collectors;

import static java.lang.String.format;
import static java.util.Collections.*;
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

    public static final String ROOT_KEY_NAME = "/";

    private final ObjectMapper mapper = new ObjectMapper();

    private DB db;

    private Map<String, Project> folder = new ConcurrentHashMap<>();

    private final ReentrantReadWriteLock lock = new ReentrantReadWriteLock();
    private final Lock readLock = lock.readLock();
    private final Lock writeLock = lock.writeLock();

    @SuppressWarnings("unused")
    @Named("db.folderName")
    private String dbFolderName;

    @PostConstruct
    public void init() {
        initDb();
        initRootFolder();
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

    private void initRootFolder() {
        final Collection<Project> projects = loadRootFolder();
        writeLock.lock();
        try {
            folder = projects
                    .stream()
                    .collect(Collectors.toMap(Project::getId, (p) -> p));
        } finally {
            writeLock.unlock();
        }
    }

    private Collection<Project> loadRootFolder() {
        final String value = asString(db.get(bytes(ROOT_KEY_NAME)));
        if (value == null) {
            LOGGER.info("Root folder is not found and has been recreated");
            db.put(bytes(ROOT_KEY_NAME), bytes("[]"));
            return emptySet();
        }
        try {
            return mapper.readValue(
                    value,
                    new TypeReference<Collection<Project>>(){
                    }
            );
        } catch (IOException e) {
            LOGGER.error("Cannot read list of projects", e);
            throw new IllegalStateException("Cannot read list of projects");
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
    public Project get(final String key) {
            readLock.lock();
            final Project project = folder.get(key);
            readLock.unlock();
            if (project == null) {
                return null;
            }
            final String rawData = asString(db.get(bytes(key)));
            if (rawData == null) {
                LOGGER.error("Cannot read project");
                throw new IllegalStateException(format("Raw data for project %s is not founded", project.getName()));
            }
            return project.cloneWith(rawData);

    }

    @Override
    @Benchmark
    public Collection<Project> findAll() {
        final Collection<Project> values;
        readLock.lock();
        try {
            values = folder.values();
        } finally {
            readLock.unlock();
        }
        return values;
    }

    @Override
    @Benchmark
    public Collection<Project> findByName(final String name) {
        readLock.lock();
        try {
            for (Project project : folder.values()) {
                if (project.getName().equals(name)) {
                    return singleton(project);
                }
            }
        } finally {
            readLock.unlock();
        }
        return emptyList();
    }

    @Override
    @Benchmark
    public Project remove(final String key) {
        final Project project = folder.get(key);
        writeLock.lock();
        try (WriteBatch batch = db.createWriteBatch()) {
            db.delete(bytes(key));
            folder.remove(key);
            db.put(bytes(ROOT_KEY_NAME), mapper.writeValueAsBytes(folder.values()));
            db.write(batch);
        } catch (IOException e) {
            LOGGER.error(format("Cannot remove project '%s'", project.getName()), e);
            throw new IllegalStateException(format("Cannot remove project '%s'", project.getName()));
        } finally {
            writeLock.unlock();
        }
        return project;
    }

    @Override
    @Benchmark
    public Project put(final Project project) {
        writeLock.lock();
        try (WriteBatch batch = db.createWriteBatch()) {
            db.put(bytes(project.getId()), bytes(project.getRaw()));
            folder.put(project.getId(), project.lightCopy());
            db.put(bytes(ROOT_KEY_NAME), mapper.writeValueAsBytes(folder.values()));
            db.write(batch);
        } catch (IOException e) {
            LOGGER.error("Cannot save project '%s'", project.getName(), e);
            throw new IllegalStateException(format("Cannot save project '%s'", project.getName()));
        }finally {
            writeLock.unlock();
        }
        return project;
    }


}
