/*
 * Copyright (c) 2013 Maxim Yunusov
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

import org.maxur.perfmodel.backend.domain.Project;
import org.maxur.perfmodel.backend.domain.Repository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.util.Collection;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

public class SimpleFileRepository implements Repository<Project> {

    private static final Logger LOGGER = LoggerFactory.getLogger(SimpleFileRepository.class);

    private static ConcurrentMap<String, Project> projectMap = new ConcurrentHashMap<>();

    private PropertiesService propertiesService;

    @Inject
    public void setPropertiesService(PropertiesService propertiesService) {
        this.propertiesService = propertiesService;
        read();
    }

    @Override
    public Project get(final String key) {
        return projectMap.get(key);
    }

    @Override
    public Project remove(final String key) {
        final Project result = projectMap.remove(key);
        write();
        return result;
    }

    @Override
    public Project put(final Project project) {
        final Project result = projectMap.put(project.getId(), project);
        write();
        return result;
    }

    @Override
    public Collection<Project> findAll() {
        return projectMap.values();
    }

    private void read() {
        final File file = new File(getFileName());
        if (file.exists()) {
            try (
                    FileInputStream fileIn = new FileInputStream(file);
                    ObjectInputStream in = new ObjectInputStream(fileIn)
            ) {
                //noinspection unchecked
                projectMap = (ConcurrentHashMap<String, Project>) in.readObject();
                LOGGER.info("Persistent Data was be restored from file " + getFileName());
            } catch (IOException | ClassNotFoundException e) {
                LOGGER.error("Data file is not loaded", e);
            }
        }
    }

    private void write() {
        try (
                FileOutputStream fileOut = new FileOutputStream(getFileName());
                ObjectOutputStream out = new ObjectOutputStream(fileOut)
        ) {
            out.writeObject(projectMap);
            LOGGER.info("Persistent Data was be serialized to file " + getFileName());
        } catch (IOException e) {
            LOGGER.error("Data file is not created", e);
        }
    }


    public String getFileName() {
        return propertiesService.asString("db.fileName", "data/projects.ser");
    }
}