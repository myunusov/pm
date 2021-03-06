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

package org.maxur.perfmodel.backend.domain;

import java.io.Serializable;
import java.util.Objects;
import java.util.Optional;

/**
 * @author Maxim Yunusov
 * @version 1.0 24.11.13
 */
public class Project implements Serializable {

    private static final long serialVersionUID = -8859706675434765594L;

    private String id;

    private String name;

    private int version;

    private String description;

    private String models;

    private String view;

    @SuppressWarnings("unused")
    public Project() {
    }

    public Project(final String id, final String name, final int version, final String description) {
        this.id = id;
        this.name = name;
        this.version = version;
        this.description = description;
    }
/*

    public Project cloneWith(final String rawData) {
        final Project result = new Project(this.id, this.name, this.version);
        result.raw = rawData;
        return result;
    }*/

    public Project brief() {
        return new Project(this.id, this.name, this.version, this.description);
    }

    public String getName() {
        return name;
    }

    public String getId() {
        return id;
    }

    public int getVersion() {
        return version;
    }

    public String getDescription() {
        return description;
    }

    public String getModels() {
        return models;
    }

    public String getView() {
        return view;
    }

    public void setModels(final String models) {
        this.models = models;
    }

    public void setView(final String view) {
        this.view = view;
    }

    public void incVersion() {
        this.version++;
    }

    public void makeVersion() {
        this.version = 1;
    }

    public void checkUniqueId(Optional<Project> otherWithSameId) throws ConflictException {
        if (otherWithSameId.isPresent()) {
            throw new ConflictException("Another project with same id '%s' already exists.", id);
        }
    }

    public boolean isSame(final Optional<Project> other) {
        //CHECKSTYLE:OFF: checkstyle:simplifybooleanexpression
        return other.isPresent()
                && Objects.equals(id, other.get().id)
                && Objects.equals(this.name, other.get().name)
                && this.version == other.get().version &&
                Objects.equals(this.description, other.get().description)
                && Objects.equals(this.models, other.get().models)
                && Objects.equals(this.view, other.get().view);
        //CHECKSTYLE:ON: checkstyle:simplifybooleanexpression
    }

    public void checkNamesakes(final Optional<Project> namesake) throws ConflictException {
        if (namesake.isPresent()) {
            if (!namesake.get().getId().equals(id)) {
                throw new ConflictException("Another project with same '%s' already exists.", name);
            }
        }
    }

    public void checkConflictWith(final Optional<Project> prevVersionOfThisProject) throws ConflictException {
        if (prevVersionOfThisProject.isPresent()) {
            if (version - 1 != prevVersionOfThisProject.get().version) {
                throw new ConflictException("Project '%s' has been changed by another user.", name);
            }
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        final Project project = (Project) o;
        return Objects.equals(version, project.version) && Objects.equals(id, project.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, version);
    }

    @Override
    public String toString() {
        return "Project{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", version=" + version +
                '}';
    }

}
