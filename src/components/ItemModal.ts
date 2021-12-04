import { App, Modal, Setting, Notice } from "obsidian";
import { uppercaseFirstChar, uppercaseFirstCharOverMultipleWordsWithReplaceSeparator } from "src/utility";

export class ItemModal extends Modal {

  onSubmit: (result: any) => void;
  successPlanItem: any;
  action: string;
  isValidName: boolean;

  constructor(app: App, action: string, successPlanItem: any, onSubmit: (result: any) => void) {
    super(app);
    this.onSubmit = onSubmit;
    this.successPlanItem = successPlanItem;
    this.action = action;
    this.isValidName = this.checkIfNameisValid(successPlanItem.name);

    console.log('constructor');
    console.log('successPlanItem:', successPlanItem);
  }

  getErrorMessage() {
    return this.isValidName ? "" : "This is an invalid name. Name's can't include /, \\, :, or .";
  }

  onOpen() {
    let { contentEl } = this;
    contentEl.createEl("h3", { text: this.action == 'EDIT' ? "Edit Item" : "Create Item", cls: "center_flex" });
    contentEl.createEl("p", { text: this.getErrorMessage(), cls: ["center_flex", "error_msg"] });

    new Setting(contentEl)
      .setName("Name")
      .addText((text) =>
        text.setValue(this.successPlanItem.name ? this.successPlanItem.name : "").onChange((value) => {
          this.successPlanItem.name = value;
          this.isValidName = this.checkIfNameisValid(value);
          let el = contentEl.querySelector(".error_msg");
          el.setText(this.getErrorMessage());

          let btn = contentEl.querySelector(".modal_submit_btn");
          if (this.isValidName) {
            btn.removeClass("modal_disabled_submit_btn");
          } else {            
            btn.addClass("modal_disabled_submit_btn");
          }
        }));

    new Setting(contentEl)
    .setName("Description")
    .addText((text) =>
        text.setValue(this.successPlanItem.description ? this.successPlanItem.description : "").onChange((value) => {
        this.successPlanItem.description = value;
        }));

    /* // Related to Make Work Fun
    new Setting(contentEl)
    .setName("Share with Family")
    .addToggle((toggleValue) =>
        toggleValue.setValue(this.successPlanItem.share_with_family === 'true').onChange((value) => {
            this.successPlanItem.share_with_family = value.toString()
        }));
    */

    new Setting(contentEl)
    .setName("Type")
    .addDropdown((cb) =>
        cb
            .addOptions({ task: "Task", project: "Project", key_result: "Key Result", goal: 'Goal' })
            .setValue(this.successPlanItem.type ? this.successPlanItem.type.toLowerCase().replace(' ', '_') : "")
            .onChange(async (val) => {
                this.successPlanItem.type = val.includes('_') ? "Key Result" : uppercaseFirstChar(val)
            })
        );

    new Setting(contentEl)
    .setName("Impact")
    .addDropdown((cb) =>
        cb
          .addOptions({ low: "Low", s_low: "S-Low", medium: "Medium", s_high: "S-High", high: 'High' })
          .setValue(this.successPlanItem.impact ? this.successPlanItem.impact.toLowerCase().replaceAll(' ', '_') : "")
          .onChange(async (val) => {
            this.successPlanItem.impact = val.includes('_') ? uppercaseFirstCharOverMultipleWordsWithReplaceSeparator(val, '_', ' ') : uppercaseFirstChar(val)
          })
      );

    new Setting(contentEl)
    .setName("Status")
    .addDropdown((cb) =>
        cb
        .addOptions({ ready_to_start: "Ready to Start", next_up: "Next Up", in_progress: "In Progress", complete: 'Complete', backlog: "Backlog", canceled: "Canceled" })
        .setValue(this.successPlanItem.status ? this.successPlanItem.status.toLowerCase().replaceAll(' ', '_') : "")
        .onChange(async (val) => {
            this.successPlanItem.status = val.includes('_') ? uppercaseFirstCharOverMultipleWordsWithReplaceSeparator(val, '_', ' ') : uppercaseFirstChar(val)
        })
    );

    if (this.successPlanItem.type == "Task") {
        new Setting(contentEl)
        .setName("Difficulty")
        .addSlider((cb) =>
            cb
            .setLimits(1, 10, 1)
            .setValue(this.successPlanItem.difficulty ? this.successPlanItem.difficulty : null)
            .onChange(async (val) => {
                this.successPlanItem.difficulty = val
            })
            .setDynamicTooltip()
        );
    }

    new Setting(contentEl)
    .setName("Do Date")
    .addMomentFormat((cb) =>
        cb
        .setDefaultFormat("MM-DD-YYYY")
        .setValue(this.successPlanItem.do_date ? this.successPlanItem.do_date.toLocaleDateString() : "")
        .onChange(async (val) => {
            this.successPlanItem.do_date = new Date(val)
        })
    );

    new Setting(contentEl)
    .setName("Due Date")
    .addMomentFormat((cb) =>
        cb
        .setDefaultFormat("MM-DD-YYYY")
        .setValue(this.successPlanItem.due_date ? this.successPlanItem.due_date.toLocaleDateString() : "")
        .onChange(async (val) => {
            this.successPlanItem.due_date = new Date(val)
        })
    );

    new Setting(contentEl)
    .setName("Closing Date")
    .addMomentFormat((cb) =>
        cb
        .setDefaultFormat("MM-DD-YYYY")
        .setValue(this.successPlanItem.closing_date ? this.successPlanItem.closing_date.toLocaleDateString() : "")
        .onChange(async (val) => {
            this.successPlanItem.closing_date = new Date(val)
        })
    );

    /* // Upstream and Downstream isn't currently functional
    new Setting(contentEl)
    .setName("Upstream")
    .addSearch((cb) =>
        cb
        .setPlaceholder("Upstream Items (Hierarchy: Tasks > Projects > Key Results > Goals")
        .setValue(this.successPlanItem.upstream != "" ? this.successPlanItem.upstream : "")
        // TODO: In the onChange method, search for the items that corresponds to the item that is being looked at (ex. Projects if this is a Task)
    );

    new Setting(contentEl) // this can be one or more items
    .setName("Downstream")
    .addSearch((cb) =>
        cb
        .setPlaceholder("Coming Soon!")
        .setValue(this.successPlanItem.downstream != "" ? this.successPlanItem.downstream : "")
        // TODO: In the onChange method, search for the items that corresponds to the item that is being looked at (ex. Projects if this is a Task)
    );
    */

    if (this.successPlanItem.type == "Task") {
        new Setting(contentEl)
        .setName("Tag (Mins Per Pomodoro)")
        .addDropdown((cb) =>
            cb
            .addOptions({ 25: "25 mins", 5: "5 Mins" }) 
            .setValue(this.successPlanItem.tag != "" ? this.successPlanItem.tag : "")
            .onChange(async (val) => {
                this.successPlanItem.tag = parseInt(val)
            })
        );
    }

    new Setting(contentEl)
    .setName("Area (Goals Only)")
    .addDropdown((cb) =>
        cb
            .addOptions({ career: "Career", 
                          family: "Family", 
                          finances: "Finances", 
                          health: 'Health', 
                          knowledge: 'Knowledge',
                          lifestyle: 'Lifestyle',
                          mindsets: 'Mindsets', // Intentionally making this Plural for MOCs
                          sharing: 'Sharing',
                          sustainable_business: 'Sustainable Business',
                          travel: 'Travel'
                         })
            .setValue(this.successPlanItem.area ? this.successPlanItem.area.toLowerCase().replace(' ', '_') : "")
            .onChange(async (val) => {
                this.successPlanItem.area = val.includes('_') ? uppercaseFirstCharOverMultipleWordsWithReplaceSeparator(val, '_', ' ') : uppercaseFirstChar(val)
            })
        );

    /* Temporarily removing this since the note-editing experience isn't great at the moment
    new Setting(contentEl)
    .setName("Notes")
    .addTextArea((cb) =>
        cb 
        .setValue(this.successPlanItem.note_content ? this.successPlanItem.note_content.trim() : "")
        .onChange(async (val) => {
            this.successPlanItem.note_content = val
        })
    );
    */

    new Setting(contentEl)
    .addButton((btn) =>
        btn
        .setClass("modal_submit_btn")
        .setButtonText(this.action == "EDIT" ? "UPDATE" : "Create")
        .setCta()
        .onClick(() => {
            if (this.isValidName) {
                this.close();
                this.onSubmit(this.successPlanItem); // TODO: Refine the outputs so they are consistent with how the inner workings work (ex. type's first character is uppercase)
            } else {
                new Notice("Invalid Name. Please choose a different name.");
            }
        }));
  }

  checkIfNameisValid(name: string): boolean {
      return name.match(/[/\\:.]/g) == null ? true : false;
  }

  onClose() {
    let { contentEl } = this;
    contentEl.empty();
  }
}