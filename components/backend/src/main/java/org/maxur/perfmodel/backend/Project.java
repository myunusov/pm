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

package org.maxur.perfmodel.backend;

import org.codehaus.jettison.json.JSONObject;

import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlTransient;
import java.io.Serializable;

/**
 * @author Maxim Yunusov
 * @version 1.0 24.11.13
 */
@XmlRootElement
public class Project implements Serializable {

    private static final long serialVersionUID = -5236202133124299315L;

    private final JSONObject raw;

    private final String id;

    private final String name;

    private int version;

    public Project(final JSONObject raw, final String id, final String name, final int version) {
        this.raw = raw;
        this.id = id;
        this.name = name;
        this.version = version;
    }


    public void checkConflictWith(final Project previousProjectVersion) throws ValidationException {
        if (previousProjectVersion == null) {
            return;
        }
        if (!id.equals(previousProjectVersion.getId())) {
            throw new ValidationException(String.format("Performance Model '%s' already exists.", name));
        }
        if (version != previousProjectVersion.getVersion()) {
            throw new ValidationException(
                    String.format("Performance Model '%s' has already been changed by another user.", name)
            );
        }
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

    public void incVersion() {
        version++;
    }

    @XmlTransient
    public JSONObject getRaw() {
        return raw;
    }
}
