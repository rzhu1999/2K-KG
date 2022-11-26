var apiUri = '';

var nodes, edges, network;

const edgeNames = {
    birthCountry: 'country of birth',
    playsFor: 'plays for',
    coachesAt: 'coaches at',
    graduatedFrom: 'graduated from',
};

var instructionText =
    'Click on nodes to <b>find related entities</b>. CTRL+click to <b>go to Wikipedia</b>. SHIFT+click to <b>collapse nodes</b>.';
var retrievalText = 'Retrieving data. Please wait...';
var noMoreDataText = 'No more data found...';

function getWikipedia(uri) {
    return uri.replace('http://dbpedia.org/resource/', 'https://en.wikipedia.org/wiki/');
}

function getDBpedia(uri) {
    return uri.replace('https://en.wikipedia.org/wiki/', 'http://dbpedia.org/resource/');
}

var HttpClient = function () {
    this.get = function (url, aCallback) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) aCallback(JSON.parse(xhr.responseText));
        };

        xhr.open('GET', url, true);
        xhr.send(null);
    };
    this.post = function (url, body, aCallback) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) aCallback(JSON.parse(xhr.responseText));
        };

        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.send(body);
    };
};

function start() {
    var uriEncoded = location.search.split('uri=')[1];

    if (uriEncoded == null) {
        param = 'https://dbpedia.org/page/Elizabeth_II';
    } else {
        param = decodeURI(uriEncoded);
    }

    var client = new HttpClient();

    let names_box = $('#names_box');

    client.get(apiUri + '/people', function (response) {
        $('#names_box').select2({
            data: response,
        });

        names_box.val(param);
        names_box.select2().trigger('change');
        init(param);
    });
}

function instruction() {
    document.getElementById('statement').innerHTML = noMoreDataText;
    setTimeout(function () {
        document.getElementById('statement').innerHTML = instructionText;
    }, 1000);
}

function visualize(parent, relation, entity) {
    if (nodes.get(entity._id) == null) {
        var node = {
            id: entity._id,
            uri: entity._id,
            next: 0,
            mass: 2.5,
        };

        if (parent != null) {
            node.x = network.getPositions(parent)[parent].x;
            node.y = network.getPositions(parent)[parent].y;
        }

        if (entity._type[0] == 'Country') {
            node.shape = 'image';
            node.image =
                'https://monatglobal.com/wp-content/uploads/2016/01/location-marker-flat.png';
            node.size = 60;
            node.label = entity.label;
            node.type = 'country';
            node.mass = 6;
        } else if (entity._type[0] == 'Person') {
            node.size = 30;
            node.type = 'person';
            node.expanded = false;
            if (entity.thumbnail != null) {
                node.image = entity.thumbnail;
                node.shape = 'circularImage';
                node.brokenImage = 'https://www.svgrepo.com/show/357886/image-broken.svg';
            } else {
                node.image =
                    'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png';
                node.shape = 'circularImage';
            }

            var description = '';
            if (entity.description != null) {
                description =
                    '<div style="white-space:pre-wrap;">' + entity.description + '</div><br>';
            }
            node.label = decodeURI(entity.label) + ' (' + entity.position + ')';
            node.title =
                '<b>2K Rating:</b>' +
                String(entity.hasRating) +
                '</br>' +
                '<b>Age:</b> ' +
                String(2022 - entity.birthYear) +
                '</br>' +
                '<b>Position:</b> ' +
                entity.position +
                '</br>' +
                '<b>Salary:</b> ' +
                entity.salary +
                '</br>' +
                'For more information, see: ' +
                getWikipedia(entity._id);
        } else if (entity._type[0] == 'Team') {
            node.size = 60;
            node.label = entity.label;
            node.type = 'team';
            node.mass = 6;
            node.expanded = false;

            if (entity.thumbnail != null) {
                node.image = entity.thumbnail;
                node.shape = 'circularImage';
                node.brokenImage = 'https://www.pngmart.com/files/22/Nba-Logo-PNG.png';
            } else {
                node.image = 'https://seeklogo.com/images/N/nba-logo-A9D3D67C30-seeklogo.com.png';
                node.shape = 'circularImage';
            }
        } else if (entity._type[0] == 'School') {
            node.size = 60;
            node.label = entity.label;
            node.type = 'school';
            node.mass = 6;
            node.expanded = false;

            if (entity.thumbnail != null) {
                node.image = entity.thumbnail;
                node.shape = 'circularImage';
                node.brokenImage = 'https://www.pngmart.com/files/22/Nba-Logo-PNG.png';
            } else {
                node.image = 'https://krishnapanchal94.github.io/Portfolio/img/project/school.png';
                node.shape = 'circularImage';
            }
        }

        try {
            nodes.add(node);
        } catch (err) {
            console.log('Error when visualising node: ' + JSON.stringify(node));
        }
    }

    if (parent != null && relation != null) {
        var edge = {};

        if (relation == 'playsFor') {
            edge = {
                id: parent + '_playsFor_' + entity._id,
                from: parent,
                to: entity._id,
                label: edgeNames.playsFor,
                arrows: {
                    to: true,
                },
                color: {
                    color: '#983131',
                    hover: '#E74E4E',
                    highlight: '#E74E4E',
                },
            };
        }
        if (relation == 'coachesAt') {
            edge = {
                id: parent + '_coachesAt_' + entity._id,
                from: parent,
                to: entity._id,
                label: edgeNames.coachesAt,
                arrows: {
                    to: true,
                },
                color: {
                    color: '#543A71',
                    hover: '#A573DC',
                    highlight: '#A573DC',
                },
            };
        }
        if (relation == 'graduatedFrom') {
            var vertices = [entity._id, parent];
            vertices.sort();
            edge = {
                id: vertices[0] + '_graduatedFrom_' + vertices[1],
                from: vertices[1],
                to: vertices[0],
                label: edgeNames.graduatedFrom,
                arrows: {
                    from: true,
                    to: false,
                },
                color: {
                    color: '#89CFF0',
                    hover: '#0000FF',
                    highlight: '#0000FF',
                },
            };
        }
        if (relation == 'birthCountry') {
            var edgeId = parent + '_country_' + entity._id;
            if (edges.get(edgeId) != null && edges.get(edgeId).rels.indexOf(relation) == -1) {
                edges.update([{ id: edgeId, label: edgeNames.both }]);
            } else {
                edge = {
                    id: edgeId,
                    from: parent,
                    to: entity._id,
                    rels: [relation],
                    label: edgeNames[relation],
                    arrows: {
                        to: true,
                    },
                    color: {
                        color: '#0E4E4A',
                        highlight: '#1FA29A',
                        hover: '#1FA29A',
                    },
                };
            }
        }
        try {
            if (edges.get(edge.id) == null) {
                edges.add(edge);
            }
        } catch (err) {
            console.log('Error when visualising edge: ' + JSON.stringify(edge));
        }
    }

    for (var property in entity) {
        if (
            entity[property] != null &&
            typeof entity[property] === 'object' &&
            entity[property].constructor === Object
        ) {
            visualize(entity._id, property, entity[property]);
        }

        if (
            entity[property] != null &&
            typeof entity[property] === 'object' &&
            entity[property].constructor === Array
        ) {
            for (let i = 0; i < entity[property].length; i++) {
                var value = entity[property][i];

                if (value != null && typeof value === 'object' && value.constructor === Object) {
                    visualize(entity._id, property, value);
                }
            }
        }
    }
}

function init(uri) {
    document.getElementById('statement').innerHTML = retrievalText;
    draw();
    var client = new HttpClient();
    var body = JSON.stringify({
        query:
            '{ Person(filter:{_id: "' +
            uri +
            '"}){ _id _type label salary position hasRating description thumbnail birthYear playsFor { _id _type label } graduatedFrom { _id _type label } birthCountry { _id _type label } } }',
    });
    client.post(apiUri + '/graphql', body, function (response) {
        visualize(null, null, response.data.Person[0]);
        instruction();
    });
}

function getRelated(parent) {
    var parentNode = nodes.get(parent);

    if (parentNode.type == 'person' && !parentNode.expanded) {
        nodes.update({ id: parent, size: 40, expanded: true });

        document.getElementById('statement').innerHTML = retrievalText;
        var query =
            '{ Person(filter: { _id:"' +
            parent +
            '"}) { _id _type salary position hasRating playsFor { _id _type label } graduatedFrom { _id _type label } birthCountry { _id _type label } } }';

        var client = new HttpClient();
        var body = JSON.stringify({ query: query });
        client.post(apiUri + '/graphql', body, function (response) {
            console.log(response.data.Person[0]);

            visualize(null, null, response.data.Person[0]);
            instruction();
        });
    }
    if (parentNode.type == 'team' && !parentNode.expanded) {
        nodes.update({ id: parent, size: 40, expanded: true });

        document.getElementById('statement').innerHTML = retrievalText;
        var query =
            '{ Team(filter: { _id:"' +
            parent +
            '"}) { _id _type hasPlayers {_id _type position salary hasRating label birthYear thumbnail label playsFor { _id _type label } } }  }';

        var client = new HttpClient();
        var body = JSON.stringify({ query: query });
        client.post(apiUri + '/graphql', body, function (response) {
            visualize(null, null, response.data.Team[0]);
            instruction();
            console.log(response);
        });
    }
    if (parentNode.type == 'school' && !parentNode.expanded) {
        nodes.update({ id: parent, size: 40, expanded: true });

        document.getElementById('statement').innerHTML = retrievalText;
        var query =
            '{ School(filter: { _id:"' +
            parent +
            '"}) { _id hasAlumni  {_id _type position salary hasRating label birthYear thumbnail label graduatedFrom { _id _type label } } }  }';

        var client = new HttpClient();
        var body = JSON.stringify({ query: query });
        client.post(apiUri + '/graphql', body, function (response) {
            visualize(null, null, response.data.School[0]);
            instruction();
            console.log(response);
        });
    }
}

function draw() {
    nodes = new vis.DataSet([]);
    edges = new vis.DataSet([]);

    var container = document.getElementById('network');

    var data = {
        nodes: nodes,
        edges: edges,
    };

    var options = {
        interaction: {
            hover: true,
            hoverConnectedEdges: true,
        },
        edges: {
            font: {
                face: 'arial',
                color: '#FFFFFF',
                strokeColor: '#000000',
            },
            width: 8,
            length: 20,
        },
        nodes: {
            font: {
                face: 'arial',
                color: '#FFFFFF',
            },
            borderWidth: 10,
            color: {
                background: '#983131',
                border: '#983131',
                highlight: '#E74E4E',
                hover: '#E74E4E',
            },
        },
        physics: {
            forceAtlas2Based: {
                centralGravity: 0.007,
                springConstant: 0.09,
                damping: 0.9,
            },
            solver: 'forceAtlas2Based',
            maxVelocity: 10,
            minVelocity: 3,
            timestep: 0.4,
        },
        interaction: {
            hover: true,
        },
    };

    network = new vis.Network(container, data, options);
    network.fit();

    network.on('click', function (params) {
        if (params.nodes[0] != null) {
            if (params.event.srcEvent.ctrlKey) {
                window.open(getWikipedia(params.nodes[0]));
            }
            if (params.event.srcEvent.shiftKey) {
                network.selectNodes([params.nodes[0]]);
                network.deleteSelected();
            } else {
                getRelated(params.nodes[0]);
            }
        }
    });

    $(document).ready(function () {
        $('#names_box').on('select2:select', function (e) {
            init($('#names_box').val());
        });

        $('#names_box').select2({
            minimumInputLength: 4,
        });
    });

    $(document).on('keydown', function (event) {
        if (event.ctrlKey) {
            $('#network').css('cursor', 'pointer');
        }
        if (event.shiftKey) {
            $('#network').css('cursor', 'not-allowed');
        }
    });

    $(document).on('keyup', function (event) {
        $('#network').css('cursor', 'auto');
    });
}
