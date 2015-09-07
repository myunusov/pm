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

package org.maxur.perfmodel.backend.rest.dto;

import org.jsondoc.core.annotation.ApiObject;
import org.jsondoc.core.annotation.ApiObjectField;
import org.maxur.perfmodel.backend.domain.Project;

import javax.xml.bind.annotation.XmlRootElement;
import java.io.Serializable;

/**
 * @author Maxim Yunusov
 * @version 1.0 24.11.13
 */
@XmlRootElement
@ApiObject(name = "Project")
public class ProjectDto implements Serializable {

    private static final long serialVersionUID = -5236202133124299315L;

    @ApiObjectField(required = true, description = "The project identifier")
    private String id;

    @ApiObjectField(required = true, description = "The project name")
    private String name;

    @ApiObjectField(required = true, description = "The project version")
    private int version;

    @ApiObjectField(required = false, description = "The project description")
    private String description;

    @ApiObjectField(required = false, description = "The Serialized presentation of the object's models")
    private String models;

    @ApiObjectField(required = false, description = "The Serialized presentation of the object's view")
    private String view;

    @SuppressWarnings("UnusedDeclaration")
    public ProjectDto() {
    }

    public ProjectDto(final String id, final String name, final int version, final String description) {
        this.id = id;
        this.name = name;
        this.version = version;
        this.description = description;
    }

    @SuppressWarnings("UnusedDeclaration")
    public String getId() {
        return id;
    }

    @SuppressWarnings("UnusedDeclaration")
    public String getName() {
        return name;
    }

    @SuppressWarnings("UnusedDeclaration")
    public int getVersion() {
        return version;
    }

    @SuppressWarnings("UnusedDeclaration")
    public String getDescription() {
        return description;
    }

    @SuppressWarnings("UnusedDeclaration")
    public String getModels() {
        return models;
    }

    @SuppressWarnings("UnusedDeclaration")
    public String getView() {
        return view;
    }

    /**
     * Create Full DTO by Project.
     * <p/>
     * @param project domain object 'Project'.
     * @return project's dto.
     */
    public static ProjectDto dto(final Project project) {
        final ProjectDto dto =
                new ProjectDto(project.getId(), project.getName(), project.getVersion(), project.getDescription());
        dto.models = project.getModels();
        dto.view = project.getView();
        return dto;
    }

    /**
     * Create entity object 'Project' from this dto.
     *
     * @return The Project.
     */
    public Project assemble() {
        final Project result = new Project(id, name, version, description);
        result.setModels(models);
        result.setView(view);
        return result;
    }
}
