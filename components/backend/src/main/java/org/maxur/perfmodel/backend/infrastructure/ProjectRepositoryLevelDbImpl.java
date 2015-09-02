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

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.iq80.leveldb.DB;
import org.iq80.leveldb.Options;
import org.iq80.leveldb.WriteBatch;
import org.jvnet.hk2.annotations.Service;
import org.maxur.perfmodel.backend.domain.Project;
import org.maxur.perfmodel.backend.domain.Repository;
import org.maxur.perfmodel.backend.service.PropertiesService;
import org.maxur.perfmodel.backend.service.Benchmark;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import javax.inject.Inject;
import java.io.File;
import java.io.IOException;
import java.util.Collection;
import java.util.Iterator;

import static java.util.stream.Collectors.toList;
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

    @Inject
    private PropertiesService propertiesService;

    private DB db;

    @PostConstruct
    public void init() {
        if (db != null) {
            return;
        }
        final Options options = new Options();
        options.createIfMissing(true);
        try {
            db = factory.open(new File(propertiesService.dbPath()), options);
            makeRoot();
            LOGGER.info("LevelDb Database is opened");
        } catch (IOException e) {
            LOGGER.error("LeveDb Database is not opened", e);
        }
    }

    private void makeRoot() {
        final String value = asString(db.get(bytes(ROOT_KEY_NAME)));
        if (value == null) {
            db.put(bytes(ROOT_KEY_NAME), bytes("[]"));
        }
    }

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
        String value = asString(db.get(bytes(key)));
        if (value == null) {
            return null;
        }
        try {
            return mapper.readValue(value, Project.class);
        } catch (IOException e) {
            LOGGER.error("Cannot read project", e);
            throw new IllegalStateException(e);
        }
    }

    @Override
    @Benchmark
    public Project remove(final String key) {
        final Project project;
        final WriteBatch batch = db.createWriteBatch();
        try {
            project = get(key);
            removeFromDir(key);
            db.delete(bytes(key));
            db.write(batch);
        } finally {
            try {
                batch.close();
            } catch (IOException e) {
                LOGGER.error("Cannot close batch", e);
            }
        }
        return project;
    }

    @Override
    @Benchmark
    public Project put(final Project project) {
        final WriteBatch batch = db.createWriteBatch();
        try {
            db.put(bytes(project.getId()), mapper.writeValueAsBytes(project));
            updateInDir(project);
            db.write(batch);
        } catch (JsonProcessingException e) {
            LOGGER.error("Cannot save project", e);
        } finally {
            try {
                batch.close();
            } catch (IOException e) {
                LOGGER.error("Cannot close batch", e);
            }
        }
        return project;
    }

    private void updateInDir(Project project) throws JsonProcessingException {
        final Collection<Project> projects = findAll();
        Iterator<Project> iterator = projects.iterator();
        while (iterator.hasNext()) {
            final Project next = iterator.next();
            if (next.getId().equals(project.getId())) {
                iterator.remove();
                break;
            }
        }
        projects.add(Project.lightCopy(project));
        db.put(bytes(ROOT_KEY_NAME), mapper.writeValueAsBytes(projects));
    }

    private void removeFromDir(final String key) {
        final Collection<Project> projects = findAll();
        Iterator<Project> iterator = projects.iterator();
        while (iterator.hasNext()) {
            final Project next = iterator.next();
            if (next.getId().equals(key)) {
                iterator.remove();
                break;
            }
        }
        try {
            db.put(bytes(ROOT_KEY_NAME), mapper.writeValueAsBytes(projects));
        } catch (JsonProcessingException e) {
            LOGGER.error("Cannot save directory", e);
        }
    }

    @Override
    @Benchmark
    public Collection<Project> findAll() {
        final String value = asString(db.get(bytes(ROOT_KEY_NAME)));
        try {
            return mapper.readValue(
                    value,
                    new TypeReference<Collection<Project>>(){
                    }
            );
        } catch (IOException e) {
            LOGGER.error("Cannot read project", e);
            throw new IllegalStateException(e);
        }
    }

    @Override
    public Collection<Project> findByName(final String name) {
        return findAll()
                .stream()
                .filter(project -> project.getName().equals(name))
                .collect(toList());
    }
}
