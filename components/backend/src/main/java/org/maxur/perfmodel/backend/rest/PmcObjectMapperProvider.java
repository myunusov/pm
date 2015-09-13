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

package org.maxur.perfmodel.backend.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.maxur.perfmodel.backend.domain.Incident;
import org.maxur.perfmodel.backend.domain.Project;

import javax.ws.rs.ext.ContextResolver;
import javax.xml.bind.JAXBException;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/**
 * @author Maxim Yunusov
 * @version 1.0
 * @since <pre>11/25/13</pre>
 */
public class PmcObjectMapperProvider implements ContextResolver<ObjectMapper> {

    private final ObjectMapper context;
    private final Set<Class<?>> types;

    public PmcObjectMapperProvider() throws JAXBException{
        final Class<?>[] cTypes = {Project.class, Incident.class};
        this.types = new HashSet<>(Arrays.asList(cTypes));
        this.context = createDefaultMapper();
    }

    @Override
    public ObjectMapper getContext(Class<?> objectType) {
        return types.contains(objectType) ? context : null;
    }

    private static ObjectMapper createDefaultMapper() {
        final ObjectMapper result = new ObjectMapper();
        result.configure(SerializationFeature.INDENT_OUTPUT, true);
        return result;
    }
}
