import React from 'react';
import { Dropdown, DropdownSection, DropdownItem, NerdGraphQuery } from 'nr1';

export default class Tags extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      allTags: null,
      searchText: '',
      selectedTag: null,
      tagTitle: 'Tags'
    }
  }

  async componentDidMount() {
    await this.constructTags();
  }

  async constructTags(){
    let domains = ['APM', 'INFRA', 'SYNTH']; //start with these domains for sample set
    let allTags = {};
    let proms = [];

    for (let domain of domains) {
      let q = `
      {
        actor {
          entitySearch(queryBuilder: {domain: ${domain}}) {
            results {
              entities {
                tags {
                  key
                  values
                }
              }
            }
          }
        }
      }
      `
      proms.push(this.queryTags(q));
    }

    Promise.all(proms).then(resp => {
      let allTags = [];
      let flattend = resp.flat();
      let first = true;

      allTags.push({title: 'Default', items: ['Default']}); //Default option

      let i = 1;
      for (let entityTags of flattend) {
        if (first == true) {
          for (let aTag of entityTags.tags) {
            allTags.push({title: aTag.key, items: []});
            allTags[i].items.push(aTag.values[0]);
            i++;
          }
          first = false;
        } else {
          for (let anotherTag of entityTags.tags) {
            let obj = allTags.filter(o => {
              return o.title == anotherTag.key;
            })
            if (obj.length > 0) {
              if (obj[0].items.includes(anotherTag.values[0])) {
                //do nothing
              } else {
                obj[0].items.push(anotherTag.values[0]);
              }
            } else {
              allTags.push({title: anotherTag.key, items: []});
              allTags[i].items.push(anotherTag.values[0]);
            }
          }
        }
      }

      this.setState({allTags: allTags});
    })
  }

  async queryTags(q) {
    let res = await NerdGraphQuery.query({query: q});
    if (res.errors) {
      console.debug(res.errors);
    } else {
      let aSetOfTags = res.data.actor.entitySearch.results.entities;
      return aSetOfTags;
    }
  }

  selected = (tagVal) => {
    const { allTags } = this.state;
    let tagKey = null;

    if (tagVal == 'Default') { //reset to default
      this.setState({ selectedTag: null, tagTitle: 'Tags' }, () => {
        this.props.setTag(this.state.selectedTag);
      })
      return;
    }

    for (let tag of allTags) {
      if (tag.items.includes(tagVal)) {
        tagKey = tag.title;
        break;
      }
    }

    this.setState({ selectedTag: tagKey + ':' + tagVal, tagTitle: tagVal }, () => {
      this.props.setTag(this.state.selectedTag);
    });
  }

  render() {
    let { allTags, searchText, tagTitle } = this.state;

    if (searchText.length > 0) {
      const re = new RegExp(searchText, 'i');
      allTags = allTags.filter(tag => {
        var val = tag.items.find(v => v.includes(searchText));
        return tag.title.match(re) || val;
      })
    }

    if (allTags == null) {
      return ''
    } else {
      return (
        <Dropdown
          style={{float: 'right'}}
          title={tagTitle} items={allTags}
          sectioned search={searchText}
          onSearch={event => this.setState({ searchText: event.target.value })}
        >
        {
          allTags.map((t,i) => {
            return (
              <DropdownSection key={i} title={t.title} items={t.items}>
              {
                t.items.map((item, k) => {
                  return <DropdownItem key={k} onClick={() => this.selected(item)}>{item}</DropdownItem>
                })
              }
              </DropdownSection>
            )
          })
        }
        </Dropdown>
      )
    }
  }
}
