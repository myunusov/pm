package org.maxur.perfmodel.backend.domain

import spock.lang.Specification

class ProjectTest extends Specification {


    def "the project conflicts with self"() {
        setup:
        def project = new Project("1", "project 1", 1)

        when:
        project.checkConflictWith(project)

        then:
        thrown(ValidationException)
    }

    def "the project conflicts with other project"() {
        setup:
        def project = new Project("1", "project 1", 1)

        when:
        project.checkConflictWith( new Project("2", "project 1", 1))

        then:
        thrown(ValidationException)
    }

    def "the project conflicts with same project"() {
        setup:
        def project = new Project("1", "project 1", 1)

        when:
        project.checkConflictWith( new Project("1", "project 1", 1))

        then:
        thrown(ValidationException)
    }

    def "the project is not conflicts with same project if version incremented and if id is same"() {
        setup:
        def project = new Project("1", "project 1", 2)

        when:
        project.checkConflictWith( new Project("1", "project 1", 1))

        then:
        notThrown(ValidationException)
    }

    def "the project conflicts with same project if version incremented more than one and if id is same"() {
        setup:
        def project = new Project("1", "project 1", 3)

        when:
        project.checkConflictWith( new Project("1", "project 1", 1))

        then:
        thrown(ValidationException)
    }

    def "the project is not conflicts with null"() {
        setup:
        def project = new Project("1", "project 1", 3)

        when:
        project.checkConflictWith(null)

        then:
        notThrown(ValidationException)
    }


}
