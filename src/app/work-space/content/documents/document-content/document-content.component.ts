import { Component, OnInit, Input, ViewChild, OnChanges } from '@angular/core';
import { Document } from '../../../../shared/models/document.model';
import { ContextMenuService, ContextMenuComponent } from 'ngx-contextmenu';
import { ContentComponent } from '../../content.component';
import { OptionsComponent } from '../../../../shared/helpers/options/options.component';
import { MenuOption } from '../../../../shared/models/menu-option.model';
import { Quote } from '../../../../shared/models/quote.model';
import { LineComponent } from './line/line.component';
import { LineService } from '../../../../shared/services/line.service';
import { Line } from '../../../../shared/models/line.model';
import { WindowSelection } from '../../../../shared/helpers/window-selection';
import { QuoteService } from '../../../../shared/services/quote.service';


@Component({
  selector: 'app-document-content',
  templateUrl: './document-content.component.html',
  styleUrls: ['./document-content.component.css']
})
export class DocumentContentComponent implements OnInit, OnChanges {

  @Input() actualDocument: Document;
  lines: Line[] = [];
  options = new OptionsComponent();
  menuOptions: MenuOption[][] = [];
  selecting = false;
  selectedLines = [];

  constructor(private contextMenuService: ContextMenuService,
  private lineService: LineService, private windowSelection: WindowSelection,
  private quoteService: QuoteService) {
  }

  ngOnInit() {
    this.createMenuOptions();
  }

  ngOnChanges() {
    if (this.actualDocument) {
      this.lines = this.actualDocument.getLines();
    }
  }

  // Open context menu, the selected text will be passed as a parameter.
  // If there's no slected text, several options won't be enabled.
  public onContextMenu($event: MouseEvent, item: any): void {
    const selectedText = this.getSelectedText();
    this.defineMenuOptions(selectedText);
    this.contextMenuService.show.next({
      contextMenu: this.options.optionsMenu,
      event: $event,
      item: selectedText
    });
    $event.preventDefault();
    $event.stopPropagation();
  }

  private createMenuOptions() {
    this.menuOptions = [[
      new MenuOption('Asociar codigo', (item) => {
        if (item) {
          console.log(item);
        } else {
          console.log('sin item');
        }
      }),
      new MenuOption('Codificar con nuevo codigo', () => { console.log('fuuun'); })
    ]];
  }

  private defineMenuOptions(selectedText) {
    if (selectedText) {
      this.menuOptions.map(group => {
        group.map(op => selectedText ? op.enabled = true : op.enabled = false);
      });
    }
  }

  // Extract from windows.selection the ids of the LineComponents which contain
  // the text that has been selected. Also create temporary quote with the selected text.
  private getSelectedText() {
    const selection = window.getSelection();
    this.windowSelection.getSelectedNodes(selection, 'app-line')
    .map(n => this.selectedLines[n.id] = true);
    return new Quote(selection.toString(), selection.baseOffset, selection.extentOffset - 1,
     this.selectedLines.length - 1 );
  }

  // Update the quotes related two each line afected from selection.
  // This function must be called after a new quote is saved.
  private updateLines(newQuote: Quote) {
    this.lines = this.lineService.updateLines(this.lines, this.selectedLines, newQuote);
    this.actualDocument.setLines(this.lines);
    this.selectedLines.splice(0);
  }

}
