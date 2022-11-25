var apiUri = '';

var nodes, edges, network;

const edgeNames = {
    birthCountry: 'country of birth',
    deathCountry: 'country of death',
    both: 'country of birth & death',
    parenthood: 'parent of',
    marriage: 'spouse of',
    team: 'plays for',
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

            var year = '';
            if (entity.birthYear != null || entity.deathYear != null) {
                year = '\n';
                if (entity.birthYear != null) {
                    year = year + String(entity.birthYear);
                }
                year = year + ' - ';
                if (entity.deathYear != null) {
                    year = year + String(entity.deathYear);
                }
            }

            var description = '';
            if (entity.description != null) {
                description =
                    '<div style="white-space:pre-wrap;">' + entity.description + '</div><br>';
            }
            node.label = decodeURI(entity.label) + year;
            node.title =
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
        }

        try {
            nodes.add(node);
        } catch (err) {
            console.log('Error when visualising node: ' + JSON.stringify(node));
        }
    }

    if (parent != null && relation != null) {
        var edge = {};

        if (relation == 'team') {
            edge = {
                id: parent + '_playsFor_' + entity._id,
                from: parent,
                to: entity._id,
                label: edgeNames.team,
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
        if (relation == 'spouse') {
            var vertices = [entity._id, parent];
            vertices.sort();
            edge = {
                id: vertices[0] + '_marriage_' + vertices[1],
                from: vertices[0],
                to: vertices[1],
                label: edgeNames.marriage,
                arrows: {
                    from: true,
                    to: true,
                },
                color: {
                    color: '#543A71',
                    hover: '#A573DC',
                    highlight: '#A573DC',
                },
            };
        }
        if (relation == 'birthCountry' || relation == 'deathCountry') {
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
            '"}){ _id _type label salary position description gender thumbnail birthYear deathYear  team { _id _type label } birthCountry { _id _type label } deathCountry { _id _type label } } }',
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
        var query = '{ Person(filter: { _id:"' + parent + '"}) { _id salary position team    } }';

        var client = new HttpClient();
        var body = JSON.stringify({ query: query });
        client.post(apiUri + '/graphql', body, function (response) {
            visualize(null, null, response.data.Person[0]);
            instruction();
            console.log(response);
        });
    }
    if (parentNode.type == 'team' && !parentNode.expanded) {
        console.log('hi');

        nodes.update({ id: parent, size: 40, expanded: true });

        document.getElementById('statement').innerHTML = retrievalText;
        var query =
            '{ Team(filter: { _id:"' +
            parent +
            '"}) { _id players {_id _type position salary label birthYear thumbnail label gender team { _id _type label}} }  }';

        var client = new HttpClient();
        var body = JSON.stringify({ query: query });
        client.post(apiUri + '/graphql', body, function (response) {
            visualize(null, null, response.data.Team[0]);
            instruction();
            console.log(response);
        });
    }
}

/*
function downloadData() {
    var people = [];
    var countries = [];

    for (uri in nodes._data) {
        var item = nodes._data[uri];
        if (item.type === 'person') {
            people.push(item.id);
        }
        if (item.type === 'country') {
            countries.push(item.id);
        }
    }

    var query =
        '{ _CONTEXT { _id _type Person Country label description gender thumbnail birthYear deathYear birthCountry deathCountry } Person(filter:{_id: [' +
        people.map(function (item) {
            return '"' + item + '"';
        }) +
        ']}){ _id _type label description gender thumbnail birthYear deathYear parent { _id } child { _id } spouse { _id } birthCountry { _id } deathCountry { _id } } Country(filter:{_id: [' +
        countries.map(function (item) {
            return '"' + item + '"';
        }) +
        ']}) { _id _type label } } ';

    var client = new HttpClient();
    var body = JSON.stringify({ query: query });
    client.post(apiUri + '/graphql', body, function (response) {
        let peopleKeys = ['parent', 'child', 'spouse'];
        let countriesKeys = ['birthCountry', 'deathCountry'];
        for (var y in response.data.Person) {
            for (var x in peopleKeys) {
                response.data.Person[y][peopleKeys[x]] = response.data.Person[y][
                    peopleKeys[x]
                ].filter(function (item) {
                    return people.indexOf(item._id) > -1;
                });
            }
            for (var x in countriesKeys) {
                response.data.Person[y][countriesKeys[x]] = response.data.Person[y][
                    countriesKeys[x]
                ].filter(function (item) {
                    return countries.indexOf(item._id) > -1;
                });
            }
        }

        result = {
            '@context': response.data._CONTEXT,
            '@id': '@graph',
            Person: response.data.Person,
            Country: response.data.Country,
        };

        var dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(result));
        var dlAnchorElem = document.getElementById('downloadAnchorElem');
        dlAnchorElem.setAttribute('href', dataStr);
        dlAnchorElem.setAttribute('download', 'data.json');
        dlAnchorElem.click();
    });
}

*/
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
