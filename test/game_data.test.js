import chai from "chai";
import chaiHttp from "chai-http";

import app from "../api/app.js";
import { disconnectDatabase } from "../api/database.js";

import "./projects.test.js";

const should = chai.should();
chai.use(chaiHttp);

const gameIds = [];

describe("Game Instances (that should all return 200):", () => {
    it("Add first Game Instance", async () => {
        const data = {
            "platform": "Windows",
            "display_size": "(1920*1080)"
        };

        const res = await chai.request(app)
            .post("/v1/TestGame")
            .send(data);

        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have.property("type").eql("success");

        gameIds.push(res.body.data._id);
    });

    it("Add second Game Instance", async () => {
        const data = {
            "platform": "Windows",
            "display_size": "(1920*1080)"
        };

        const res = await chai.request(app)
            .post("/v1/TestGame")
            .send(data);

        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have.property("type").eql("success");

        gameIds.push(res.body.data._id);
    });

    it("Update the Game Instance with session and session length data", async () => {
        const data = {
            "sessions": 4,
            "sessions_length": [1222, 465, 48464, 556]
        };

        const res = await chai.request(app)
            .patch("/v1/TestGame/" + gameIds[0])
            .send(data);

        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have.property("type").eql("success");
    });

    it("Update the Game Instance with single choice data", async () => {
        const data = {
            "key": "third_choice",
            "data": "Third Choice: Option 2"
        };

        const res = await chai.request(app)
            .patch("/v1/TestGame/" + gameIds[0] + "/choice")
            .send(data);

        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have.property("type").eql("success");
    });

    it("Update the Game Instance with multiple choice data", async () => {
        const data = {
            "key": ["first_choice", "second_choice"],
            "data": ["First Choice: Option 1", "Second Choice: Option 3"]
        };

        const res = await chai.request(app)
            .patch("/v1/TestGame/" + gameIds[0] + "/choice")
            .send(data);

        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have.property("type").eql("success");
    });

    it("Update the Game Instance with single relationship data", async () => {
        const data = {
            "key": "first_chara",
            "data": 1
        };    

        const res = await chai.request(app)
            .patch("/v1/TestGame/" + gameIds[0] + "/relationship")
            .send(data);

        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have.property("type").eql("success");
    });

    it("Update the Game Instance with multiple relationship data", async () => {
        const data = {
            "key": ["second_chara", "third_chara"],
            "data": [10, 8]
        };    

        const res = await chai.request(app)
            .patch("/v1/TestGame/" + gameIds[0] + "/relationship")
            .send(data);

        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have.property("type").eql("success");
    });

    it("Update the Game Instance with single play data", async () => {
        const data = {
            "key": "first_play_key",
            "data": {
                "first_data_key": "FIRST",
                "second_data_key": "This is fourth"
            }
        };    

        const res = await chai.request(app)
            .patch("/v1/TestGame/" + gameIds[0] + "/play")
            .send(data);

        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have.property("type").eql("success");
    });

    it("Update the Game Instance with multiple play data", async () => {
        const data = {
            "key": ["second_play_key", "third_play_key"],
            "data": [
                {
                "first_data_key": 1,
                "second_data_key": "#fff"
                },
                {
                "first_data_key": ["FIRST"],
                "second_data_key": "This is fourth"
                }
            ]
        };

        const res = await chai.request(app)
            .patch("/v1/TestGame/" + gameIds[0] + "/play")
            .send(data);

        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have.property("type").eql("success");
    });

    it("Update the Game Instance using batch API request", async () => {
        const data = [
            {
                "type": "self",
                "data": {
                    "sessions": 5,
                    "sessions_length": [1222, 465, 48464, 556, 7862]
                }
            },
            {
                "type": "choice",
                "key": "fourth_choice",
                "data": "Fourth Choice: Option 4"
            }
        ];

        const res = await chai.request(app)
            .patch("/v1/TestGame/" + gameIds[0] + "/batch")
            .send(data);

        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.self.should.have.property("type").eql("success");
        res.body.choice.should.have.property("type").eql("success");
    });

    it("End the Game Instance", async () => {
        const data = {
            "sessions": 6,
            "play_time": 66000,
            "sessions_length": [1222, 465, 48464, 556, 7862, 8542],
            "ending": "Happy ending",
            "end_data": {
                "end_score": 45000
            }
        };

        const res = await chai.request(app)
            .patch("/v1/TestGame/" + gameIds[0] + "/end")
            .send(data);

        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have.property("type").eql("success");
    });

    it("Delete the second Game Instance", async () => {
        const res = await chai.request(app)
            .delete("/v1/TestGame/" + gameIds[1]);

        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have.property("type").eql("success");
    });
});

describe("Game Instances (that should all return 400):", () => {
    it("Test by giving random string as Project ID", async () => {
        const res = await chai.request(app).post("/v1/RandomString");

        res.should.have.status(400);
        res.body.should.be.a("object");
        res.body.should.have.property("type").eql("failure");
        res.body.should.have.property("message").eql("The provided Project ID does not exist in our database.");
    });

    it("Test by giving random string as game ID", async () => {
        const res = await chai.request(app).post("/v1/TestGame/64de0199639e9a");

        res.should.have.status(400);
        res.body.should.be.a("object");
        res.body.should.have.property("type").eql("failure");
        res.body.should.have.property("message").eql("Please provide a valid Game ID.");
    });

    it("Try to delete an already deleted Game Insatnce", async () => {
        const res = await chai.request(app)
            .delete("/v1/TestGame/" + gameIds[1]);

            delete gameIds[1];
            res.should.have.status(400);
            res.body.should.be.a("object");
            res.body.should.have.property("type").eql("failure");
            res.body.should.have.property("message").eql("Game Instance with this ID was not found.");
    });

    describe("Tests for / endpoint", () => {
        it("Try to add first Game Instance without any data", async () => {
            const res = await chai.request(app)
                .post("/v1/TestGame");

            res.should.have.status(400);
            res.body.should.be.a("object");
            res.body.should.have.property("type").eql("failure");
            res.body.should.have.property("message").eql("Following keys are missing from the request: platform,display_size");
        });

        it("Try to add first Game Instance without a required parameter", async () => {
            const data = {
                "platform": "Windows"
            };

            const res = await chai.request(app)
                .post("/v1/TestGame")
                .send(data);

            res.should.have.status(400);
            res.body.should.be.a("object");
            res.body.should.have.property("type").eql("failure");
            res.body.should.have.property("message").eql("Following keys are missing from the request: display_size");
        });

        it("Try to add first Game Instance with an extra parameter", async () => {
            const data = {
                "platform": "Windows",
                "display_size": "(1920*1080)",
                "random": 1234
            };

            const res = await chai.request(app)
                .post("/v1/TestGame")
                .send(data);

            res.should.have.status(400);
            res.body.should.be.a("object");
            res.body.should.have.property("type").eql("failure");
            res.body.should.have.property("message").eql("Extra data is provided with the request: random");
        });

        it("Try to add first Game Instance with a wrong value type for parameter", async () => {
            const data = {
                "platform": "Windows",
                "display_size": 1920
            };

            const res = await chai.request(app)
                .post("/v1/TestGame")
                .send(data);

            res.should.have.status(400);
            res.body.should.be.a("object");
            res.body.should.have.property("type").eql("failure");
            res.body.should.have.property("message").eql("Following keys have invalid value types: display_size");
        });
    });

    describe("Tests for /:gameId endpoint", () => {
        it("Try to update the Game Instance without providing any data", async () => {
            const res = await chai.request(app)
                .patch("/v1/TestGame/" + gameIds[0]);

            res.should.have.status(400);
            res.body.should.be.a("object");
            res.body.should.have.property("type").eql("failure");
            res.body.should.have.property("message").eql("Please send data to be updated with your request.");
        });

        it("Try to update the Game Instance with a wrong value type session", async () => {
            const data = {
                "sessions": "4",
                "sessions_length": [1222, 465, 48464, 556]
            };

            const res = await chai.request(app)
                .patch("/v1/TestGame/" + gameIds[0])
                .send(data);

            res.should.have.status(400);
            res.body.should.be.a("object");
            res.body.should.have.property("type").eql("failure");
            res.body.should.have.property("message").eql("Following keys have invalid value types: sessions");
        });

        it("Try to update the Game Instance with a negative value in session length", async () => {
            const data = {
                "sessions": 4,
                "sessions_length": [-1222, 465, -48464, 556]
            };

            const res = await chai.request(app)
                .patch("/v1/TestGame/" + gameIds[0])
                .send(data);

            res.should.have.status(400);
            res.body.should.be.a("object");
            res.body.should.have.property("type").eql("failure");
            res.body.should.have.property("message").eql("Session length values can only be positive numbers.");
        });

        it("Try to update the Game Instance with an unequal number of sessions and session_length", async () => {
            const data = {
                "sessions": 3,
                "sessions_length": [1222, 465, 48464, 556]
            };

            const res = await chai.request(app)
                .patch("/v1/TestGame/" + gameIds[0])
                .send(data);

            res.should.have.status(400);
            res.body.should.be.a("object");
            res.body.should.have.property("type").eql("failure");
            res.body.should.have.property("message").eql("Number of sessions and session length should be same.");
        });

        it("Try to update the Game Instance with a negative value in play time", async () => {
            const data = {
                "play_time": -5245
            };

            const res = await chai.request(app)
                .patch("/v1/TestGame/" + gameIds[0])
                .send(data);

            res.should.have.status(400);
            res.body.should.be.a("object");
            res.body.should.have.property("type").eql("failure");
            res.body.should.have.property("message").eql("play_time can only be a positive number.");
        });
    });

    describe("Tests for /:gameId/choice endpoint", () => {
        it("Try to update the Game Instance without giving key property in choice data", async () => {
            const data = {
                "data": 1234
            };

            const res = await chai.request(app)
                .patch("/v1/TestGame/" + gameIds[0] + "/choice")
                .send(data);

            res.should.have.status(400);
            res.body.should.be.a("object");
            res.body.should.have.property("type").eql("failure");
            res.body.should.have.property("message").eql("Please provide a key for this update with your request.");
        });

        it("Try to update the Game Instance without giving data property in choice data", async () => {
            const data = {
                "key": 1234
            };

            const res = await chai.request(app)
                .patch("/v1/TestGame/" + gameIds[0] + "/choice")
                .send(data);

            res.should.have.status(400);
            res.body.should.be.a("object");
            res.body.should.have.property("type").eql("failure");
            res.body.should.have.property("message").eql("Please provide data for this update with your request.");
        });

        it("Try to update the Game Instance with non string value type for key in choice data", async () => {
            const data = {
                "key": 1234,
                "data": "Third Choice: Option 2"
            };

            const res = await chai.request(app)
                .patch("/v1/TestGame/" + gameIds[0] + "/choice")
                .send(data);

            res.should.have.status(400);
            res.body.should.be.a("object");
            res.body.should.have.property("type").eql("failure");
            res.body.should.have.property("message").eql("Choice key can only be a string.");
        });

        it("Try to update the Game Instance with non string value type for data in choice data", async () => {
            const data = {
                "key": "third_choice",
                "data": 1234
            };

            const res = await chai.request(app)
                .patch("/v1/TestGame/" + gameIds[0] + "/choice")
                .send(data);

            res.should.have.status(400);
            res.body.should.be.a("object");
            res.body.should.have.property("type").eql("failure");
            res.body.should.have.property("message").eql("Choice text can only be a string.");
        });

        it("Try to update the Game Instance with multiple key values and less data values in choice data", async () => {
            const data = {
                "key": ["second_choice", "third_choice"],
                "data": 1234
            };

            const res = await chai.request(app)
                .patch("/v1/TestGame/" + gameIds[0] + "/choice")
                .send(data);

            res.should.have.status(400);
            res.body.should.be.a("object");
            res.body.should.have.property("type").eql("failure");
            res.body.should.have.property("message").eql("Key and data length do not match.");
        });
    });

    describe("Tests for /:gameId/relationship endpoint", () => {
        it("Try to update the Game Instance without giving key property in relationship data", async () => {
            const data = {
                "data": 1234
            };

            const res = await chai.request(app)
                .patch("/v1/TestGame/" + gameIds[0] + "/relationship")
                .send(data);

            res.should.have.status(400);
            res.body.should.be.a("object");
            res.body.should.have.property("type").eql("failure");
            res.body.should.have.property("message").eql("Please provide a key for this update with your request.");
        });

        it("Try to update the Game Instance without giving data property in relationship data", async () => {
            const data = {
                "key": 1234
            };

            const res = await chai.request(app)
                .patch("/v1/TestGame/" + gameIds[0] + "/relationship")
                .send(data);

            res.should.have.status(400);
            res.body.should.be.a("object");
            res.body.should.have.property("type").eql("failure");
            res.body.should.have.property("message").eql("Please provide data for this update with your request.");
        });

        it("Try to update the Game Instance by giving non string for key in relationship data", async () => {
            const data = {
                "key": 1234,
                "data": "12"
            };

            const res = await chai.request(app)
                .patch("/v1/TestGame/" + gameIds[0] + "/relationship")
                .send(data);

            res.should.have.status(400);
            res.body.should.be.a("object");
            res.body.should.have.property("type").eql("failure");
            res.body.should.have.property("message").eql("Relationship key can only be a string.");
        });

        it("Try to update the Game Instance by giving non number for data in relationship data", async () => {
            const data = {
                "key": "first_chara",
                "data": "12"
            };

            const res = await chai.request(app)
                .patch("/v1/TestGame/" + gameIds[0] + "/relationship")
                .send(data);

            res.should.have.status(400);
            res.body.should.be.a("object");
            res.body.should.have.property("type").eql("failure");
            res.body.should.have.property("message").eql("Relationship value can only be a number.");
        });

        it("Try to update the Game Instance by giving multiple values for key but lesser values data in relationship data", async () => {
            const data = {
                "key": ["first_chara", "second_chara"],
                "data": 12
            };

            const res = await chai.request(app)
                .patch("/v1/TestGame/" + gameIds[0] + "/relationship")
                .send(data);

            res.should.have.status(400);
            res.body.should.be.a("object");
            res.body.should.have.property("type").eql("failure");
            res.body.should.have.property("message").eql("Key and data length do not match.");
        });

        it("Try to update the Game Instance by giving multiple values for key but more values data in relationship data", async () => {
            const data = {
                "key": ["first_chara", "second_chara"],
                "data": [12, 12, 12]
            };

            const res = await chai.request(app)
                .patch("/v1/TestGame/" + gameIds[0] + "/relationship")
                .send(data);

            res.should.have.status(400);
            res.body.should.be.a("object");
            res.body.should.have.property("type").eql("failure");
            res.body.should.have.property("message").eql("Key and data length do not match.");
        });
    });

    describe("Tests for /:gameId/play endpoint", () => {
        it("Try to update the Game Instance without giving key property in play data", async () => {
            const data = {
                "data": 1234
            };

            const res = await chai.request(app)
                .patch("/v1/TestGame/" + gameIds[0] + "/play")
                .send(data);

            res.should.have.status(400);
            res.body.should.be.a("object");
            res.body.should.have.property("type").eql("failure");
            res.body.should.have.property("message").eql("Please provide a key for this update with your request.");
        });

        it("Try to update the Game Instance without giving data property in play data", async () => {
            const data = {
                "key": 1234
            };

            const res = await chai.request(app)
                .patch("/v1/TestGame/" + gameIds[0] + "/play")
                .send(data);

            res.should.have.status(400);
            res.body.should.be.a("object");
            res.body.should.have.property("type").eql("failure");
            res.body.should.have.property("message").eql("Please provide data for this update with your request.");
        });

        it("Try to update the Game Instance by giving non string for key in play data", async () => {
            const data = {
                "key": 1234,
                "data": "12"
            };

            const res = await chai.request(app)
                .patch("/v1/TestGame/" + gameIds[0] + "/play")
                .send(data);

            res.should.have.status(400);
            res.body.should.be.a("object");
            res.body.should.have.property("type").eql("failure");
            res.body.should.have.property("message").eql("Play key can only be a string.");
        });

        it("Try to update the Game Instance with multiple key values and less data values in play data", async () => {
            const data = {
                "key": ["first_play_field", "second_play_field"],
                "data": 1234
            };

            const res = await chai.request(app)
                .patch("/v1/TestGame/" + gameIds[0] + "/play")
                .send(data);

            res.should.have.status(400);
            res.body.should.be.a("object");
            res.body.should.have.property("type").eql("failure");
            res.body.should.have.property("message").eql("Key and data length do not match.");
        });
    });

    describe("Tests for /:gameId/batch endpoint", () => {
        it("Try to update the Game Instance with non array value", async () => {
            const data = {
                "type": "self",
                "data": {
                    "sessions": 5,
                    "sessions_length": [1222, 465, 48464, 556, 7862]
                }
            };

            const res = await chai.request(app)
                .patch("/v1/TestGame/" + gameIds[0] + "/batch")
                .send(data);

            res.should.have.status(400);
            res.body.should.be.a("object");
            res.body.should.have.property("type").eql("failure");
            res.body.should.have.property("message").eql("Invalid batch data.");
        });

        it("Try to update the Game Instance with type that are not supported by batch", async () => {
            const data = [
                {
                    "type": "end",
                    "data": {
                        "sessions": 6,
                        "play_time": 66000,
                        "sessions_length": [1222, 465, 48464, 556, 7862, 8542],
                        "ending": "Happy ending",
                        "end_data": {
                            "end_score": 45000
                        }
                    }
                }
            ];

            const res = await chai.request(app)
                .patch("/v1/TestGame/" + gameIds[0] + "/batch")
                .send(data);

            res.should.have.status(400);
            res.body.end.should.be.a("object");
            res.body.end.should.have.property("type").eql("failure");
            res.body.end.should.have.property("message").eql("This type isn't supported for batch processing.");
        });
    });

    describe("Tests for /:gameId/end endpoint", () => {
        it("Try to end the Game Instance without providing all the required values", async () => {
            const data = {
                "sessions": 6,
                "play_time": 66000,
            };

            const res = await chai.request(app)
                .patch("/v1/TestGame/" + gameIds[0] + "/end")
                .send(data);

            res.should.have.status(400);
            res.body.should.be.a("object");
            res.body.should.have.property("type").eql("failure");
            res.body.should.have.property("message").eql("Required keys are missing from the request: ending,sessions_length");
        });

        it("Try to end the Game Instance that is already marked as finished", async () => {
            const data = {
                "sessions": 6,
                "play_time": 66000,
                "sessions_length": [1222, 465, 48464, 556, 7862, 8542],
                "ending": "Happy ending",
                "end_data": {
                    "end_score": 45000
                }
            };

            const res = await chai.request(app)
                .patch("/v1/TestGame/" + gameIds[0] + "/end")
                .send(data);

            res.should.have.status(400);
            res.body.should.be.a("object");
            res.body.should.have.property("type").eql("failure");
            res.body.should.have.property("message").contains(" is already marked as ended.");
        });
    });
});

after(async () => {
    await disconnectDatabase();
});
