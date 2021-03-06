import {fromJS} from 'immutable';
import {Link, browserHistory} from 'react-router';
import React from 'react';
import styles from './navigation.css';
import {getSuggestions} from '../../stores/search';
import typeahead$, {getSuggestions as getTypeahead, clearSuggestions as clearTypeahead} from '../../stores/typeahead';
import clearAll from '../../stores/util/clearAll';

import GHIcon from './gh-icon';

const Navigation = React.createClass({
    getInitialState() {
        return {
            typeahead: fromJS({results: []}),
            showTypeahead: false,
        };
    },

    componentWillMount() {
        this.searchSub = typeahead$.subscribe(typeahead => this.setState({typeahead}));
    },
    componentWillUnmount() {
        this.searchSub.dispose();
    },

    resetTypeahead() {
        this.setState({showTypeahead: false});
        this.refs.search.value = '';
        clearTypeahead();
    },

    handleInput(e) {
        e.preventDefault();
        if (e.key === 'Escape') {
            this.setState({showTypeahead: false});
            return;
        }
        if (e.target.value.length === 0) {
            this.resetTypeahead();
            return;
        }
        if (e.key === 'Enter') {
            getSuggestions(e);
            this.resetTypeahead();
            browserHistory.push('/');
            return;
        }

        this.setState({showTypeahead: true});
        getTypeahead(e);
    },

    handleResource(item) {
        const {url, title} = item;
        this.resetTypeahead();
        clearAll();
        browserHistory.push({
            pathname: '/resource',
            search: `?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
            state: item,
        });
    },

    render() {
        return (
            <nav className="navbar navbar-inverse">
                <div className="navbar-header">
                    <Link to="/" className="navbar-brand">Genesis</Link>
                </div>
                <div className={`collapse navbar-collapse ${styles.searchHolder}`}>
                    <div className={`navbar-form navbar-left ${styles.searchFlex}`}>
                        <div className={`form-group ${styles.searchInput}`}>
                            <input
                                type="text"
                                ref="search"
                                placeholder="Search"
                                className={`form-control ${styles.searchInput}`}
                                onKeyUp={this.handleInput}
                            />
                            <ul
                                className={`dropdown-menu ${styles.typeahead}`}
                                style={{display:
                                    this.state.showTypeahead && this.state.typeahead.get('results').count() > 0 ?
                                    'block' : 'none'}}
                            >
                                {this.state.typeahead.get('results')
                                .toJS().slice(0, 10).map(res => (
                                    <li key={res.url}>
                                        <a href="#" onClick={() => this.handleResource(res)}>
                                            {res.title}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <ul className="nav navbar-nav navbar-right">
                        <li>
                            <a
                                href="https://github.com/AKSW/Ginseng"
                                className="hint--left"
                                data-hint="Grab the source code"
                            >
                                <GHIcon />
                            </a>
                        </li>
                    </ul>
                </div>
            </nav>
        );
    },
});

export default Navigation;
