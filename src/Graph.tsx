import React, { Component } from 'react';
import { Table } from '@jpmorganchase/perspective';
import { ServerRespond } from './DataStreamer';
import './Graph.css';

/**
 * Props declaration for <Graph />
 */
interface IProps {
  data: ServerRespond[],  
}

/**
 * Perspective library adds load to HTMLElement prototype.
 * This interface acts as a wrapper for Typescript compiler.
 */
interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void,
}

/**
 * React component that renders Perspective based on data
 * parsed from its parent through data property.
 */
class Graph extends Component<IProps, {}> {
  // Perspective table
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
    console.log('rendering');
    // Get element to attach the table from the DOM.
    const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

    const schema = {
      stock: 'string',
      top_ask_price: 'float',
      top_bid_price: 'float',
      timestamp: 'date',
    };

    if (window.perspective && window.perspective.worker() ) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.
    
      // Add more Perspective configurations here.
      elem.setAttribute('view', 'y_line'); /**a continuous line graph view to be the final outcome, the closest one would be y_line */
      elem.setAttribute('column-pivots', '["stock"]'); /**It will allow us to distinguish between stocks */
      elem.setAttribute('row-pivots', '["timestamp"]');/**Choosing timestamp as x_axis since we wish to visualize the
                                                        timestamp for top_ask_price  */
      elem.setAttribute('columns', '["top_ask_price"]'); /** Since we are concerned about the price at which the 
                                                        seller is ready to sell the stocks, so choosing top_ask_price as y axis */
      elem.setAttribute('aggregates','{"stock":"distinct count","top_ask_price":"avg","top_bid_price":"avg","timestamp":"distinct count"}');
      /**‘aggregates’ is what will allow us to handle the duplicated data we observed earlier and consolidate them as just one data point. In our case we only want to
        consider a data point unique if it has a unique stock name and timestamp.Otherwise, if there are duplicates like what we had before, we will average out
        the top_bid_prices and the top_ask_prices of these ‘similar’ datapoints beforetreating them as one. */
    elem.load(this.table);
  }
}
    componentDidUpdate() {
            // Everytime the data props is updated, insert the data into Perspective table
            if (this.table) {
              // As part of the task, you need to fix the way we update the data props to
              // avoid inserting duplicated entries into Perspective table again.
              this.table.update(this.props.data.map((el: any) => {
                // Format the data from ServerRespond to the schema
                return {
                  stock: el.stock,
                  top_ask_price: el.top_ask && el.top_ask.price || 0,
                  top_bid_price: el.top_bid && el.top_bid.price || 0,
                  timestamp: el.timestamp,
                };
              }));
            }
        }
      }
  
    

  


export default Graph;
