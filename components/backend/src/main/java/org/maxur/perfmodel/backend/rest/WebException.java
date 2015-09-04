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

import org.maxur.perfmodel.backend.domain.Incident;

import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.GenericEntity;
import javax.ws.rs.core.Response;
import java.util.ArrayList;
import java.util.List;

import static javax.ws.rs.core.MediaType.APPLICATION_JSON;
import static javax.ws.rs.core.Response.Status.BAD_REQUEST;
import static javax.ws.rs.core.Response.Status.CONFLICT;
import static javax.ws.rs.core.Response.Status.NOT_FOUND;

/**
 * @author Maxim Yunusov
 * @version 1.0 06.11.13
 */
public final class WebException extends WebApplicationException {

    private static final long serialVersionUID = -2826609919565709334L;

    private WebException(final Response.Status status, final String... messages) {
        super(Response
                .status(status)
                .type(APPLICATION_JSON)
                .entity(new GenericEntity<List<Incident>>(makeIncident(messages)) {
                })
                .build());
    }

    private static List<Incident> makeIncident(String[] messages) {
        final List<Incident> result = new ArrayList<>();
        for (String message : messages) {
            result.add(new Incident(message));
        }
        return result;
    }

    public static WebException notFoundException(final String... errors) {
        return new WebException(NOT_FOUND, errors);
    }

    public static WebException badRequestException(final String... errors) {
        return new WebException(BAD_REQUEST, errors);
    }

    public static WebException conflictException(final String... errors) {
        return new WebException(CONFLICT, errors);
    }


}