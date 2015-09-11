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

package org.maxur.perfmodel.backend.rest;

import org.maxur.perfmodel.backend.domain.Incident;

import javax.ws.rs.core.GenericEntity;
import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import java.util.List;

import static javax.ws.rs.core.MediaType.APPLICATION_JSON;
import static javax.ws.rs.core.Response.Status.INTERNAL_SERVER_ERROR;
import static org.maxur.perfmodel.backend.domain.Incident.incidents;

/**
 * @author myunusov
 * @version 1.0
 * @since <pre>11.09.2015</pre>
 */
public class RuntimeExceptionHandler implements ExceptionMapper<RuntimeException> {

    @Override
    public Response toResponse(RuntimeException exception) {
        return Response
                .status(INTERNAL_SERVER_ERROR)
                .type(APPLICATION_JSON)
                .entity(makeErrorEntity(exception))
                .build();
    }

    private GenericEntity<List<Incident>> makeErrorEntity(final RuntimeException exception) {
        return new GenericEntity<List<Incident>>(incidents("System error", exception.getMessage())) {
        };
    }


}
