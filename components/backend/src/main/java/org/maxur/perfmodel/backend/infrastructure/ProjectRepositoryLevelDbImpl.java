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

import org.iq80.leveldb.WriteBatch;
import org.jvnet.hk2.annotations.Service;
import org.maxur.perfmodel.backend.domain.ConflictException;
import org.maxur.perfmodel.backend.domain.Project;
import org.maxur.perfmodel.backend.domain.Repository;
import org.maxur.perfmodel.backend.service.Benchmark;
import org.maxur.perfmodel.backend.service.DataSource;
import org.slf4j.Logger;

import javax.inject.Inject;
import java.io.IOException;
import java.util.Collection;
import java.util.Optional;

import static java.lang.String.format;
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

    private static final Logger LOGGER = getLogger(ProjectRepositoryLevelDbImpl.class);

    public static final String ROOT_PREFIX = "/";

    @Inject
    private DataSource dataSource;

    @Override
    @Benchmark
    public Optional<Project> get(final String key) {
        try {
            return dataSource.get(key);
        } catch (IOException | ClassNotFoundException e) {
            return throwError(e, "Cannot find project by id '%s'", key);
        }
    }

    @Override
    @Benchmark
    public Collection<Project> findAll() {
        try {
            return dataSource.findAllByPrefix(ROOT_PREFIX);
        } catch (IOException | ClassNotFoundException e) {
            return throwError(e, "Cannot get all projects");
        }
    }

    @Override
    @Benchmark
    public Optional<Project> findByName(final String name) {
        try {
            return dataSource.get(path(name));
        } catch (IOException | ClassNotFoundException e) {
            return throwError(e, "Cannot find project by name '%s'", name);
        }
    }

    @Override
    @Benchmark
    public Optional<Project> remove(final String key) {
        try (WriteBatch batch = dataSource.createWriteBatch()) {
            final Optional<Project> result = dataSource.get(key);
            if (result.isPresent()) {
                dataSource.delete(key);
                dataSource.delete(path(result.get().getName()));
                dataSource.commit(batch);
            }
            return result;
        } catch (IOException | ClassNotFoundException e) {
            return throwError(e, "Cannot remove project '%s'", key);
        }

    }


    @Override
    @Benchmark
    public Optional<Project> put(final Project value) throws ConflictException {
        final String id = value.getId();
        final String newName = value.getName();
        try (WriteBatch batch = dataSource.createWriteBatch()) {
            value.checkNamesakes(findByName(newName));
            final Optional<Project> prev = dataSource.get(id);
            if (prev.isPresent()) {
                value.checkConflictWith(prev);
                value.incVersion();
                final boolean mustBeRenamed = !prev.get().getName().equals(newName);
                if (mustBeRenamed) {
                    dataSource.delete(path(prev.get().getName()));
                }
            }
            dataSource.put(id, value);
            dataSource.put(path(newName), value.brief());
            dataSource.commit(batch);
            return Optional.of(value);
        } catch (IOException | ClassNotFoundException e) {
            return throwError(e, "Cannot save project '%s'", newName);
        }
    }

    private String path(final String name) {
        return ROOT_PREFIX + name;
    }

    private static <T> T throwError(final Exception e, final String message, final String... args) {
        final String msg = format(message, args);
        LOGGER.error(msg, e);
        throw new IllegalStateException(msg, e);
    }

}
