import chai from "chai";
import chaiHttp from "chai-http";

import app from "../api/app.js";

const should = chai.should();
chai.use(chaiHttp);

const project_ids = {};

describe("Project (that should all return 200):", () => {
    before(async () => {
        const res = await chai.request(app)
            .delete("/v1")
            .set("Delete-Project-Auth", process.env.DELETE_PROJECT_KEY);

        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have.property("type").eql("success");
    });

    it("Add first project", async () => {
        const project = {
            "project_id": "TestGame",
            "title": "Test",
            "developer": "Test",
            "engine": "Ren'Py"
        };

        const res = await chai.request(app)
            .post("/v1")
            .set("Create-Project-Auth", process.env.CREATE_NEW_PROJECT_KEY)
            .send(project);

        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have.property("type").eql("success");

        project_ids[res.body.data.project_id] = res.body.data._id;
    });

    it("Add second project", async () => {
        const project = {
            "project_id": "TestGame2",
            "title": "Test",
            "developer": "Test",
            "engine": "Ren'Py"
        };

        const res = await chai.request(app)
            .post("/v1")
            .set("Create-Project-Auth", process.env.CREATE_NEW_PROJECT_KEY)
            .send(project);

        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have.property("type").eql("success");

        project_ids[res.body.data.project_id] = res.body.data._id;
    });

    it("Check if project is added properly", async () => {
        const res = await chai.request(app).get("/v1/TestGame");

        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have.property("type").eql("success");
    });

    it("Update the first project description", async () => {
        const query = {
            "id": project_ids["TestGame"],
            "description": "Test description #2."
        };

        const res = await chai.request(app)
            .patch("/v1/TestGame")
            .send(query);

        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have.property("type").eql("success");
    })

    it("Adding same project again should not be possible", async () => {
        const project = {
            "project_id": "TestGame",
            "title": "Test",
            "developer": "Test",
            "engine": "Ren'Py"
        };

        const res = await chai.request(app)
            .post("/v1")
            .set("Create-Project-Auth", process.env.CREATE_NEW_PROJECT_KEY)
            .send(project);

        res.should.have.status(400);
        res.body.should.be.a("object");
        res.body.should.have.property("type").eql("failure");
    });

    it("Count how many projects", async () => {
        const res = await chai.request(app).get("/v1/total_projects");

        res.should.have.status(200);
        res.body.should.have.property("data").eql(2);
    });
});

describe("Project (that should all return 400):", () => {
    it("Try to add a project without the header", async () => {
        const project = {
            "project_id": "TestGameFail",
            "title": "Test",
            "developer": "Test",
            "engine": "Ren'Py"
        };

        const res = await chai.request(app)
            .post("/v1")
            .send(project);

        res.should.have.status(400);
        res.body.should.be.a("object");
        res.body.should.have.property("type").eql("failure");
        res.body.should.have.property("message").eql("Contact admin for the correct auth key.");
    });

    it("Try to add a project without all the required properties", async () => {
        const project = {
            "project_id": "TestGameFail",
            "title": "Test",
            "developer": "Test"
        };

        const res = await chai.request(app)
            .post("/v1")
            .set("Create-Project-Auth", process.env.CREATE_NEW_PROJECT_KEY)
            .send(project);

        res.should.have.status(400);
        res.body.should.be.a("object");
        res.body.should.have.property("type").eql("failure");
        res.body.should.have.property("message").eql("Following keys are missing from the request: engine");
    });

    it("Try to add a project with useless properties", async () => {
        const project = {
            "project_id": "TestGameFail",
            "title": "Test",
            "developer": "Test",
            "engine": "Ren'Py",
            "bar": "foo"
        };

        const res = await chai.request(app)
            .post("/v1")
            .set("Create-Project-Auth", process.env.CREATE_NEW_PROJECT_KEY)
            .send(project);

        res.should.have.status(400);
        res.body.should.be.a("object");
        res.body.should.have.property("type").eql("failure");
        res.body.should.have.property("message").eql("Extra data is provided with the request: bar");
    });
});
