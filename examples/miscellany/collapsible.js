import {collapsible, ul} from "../../jtml.js";

export default collapsible(
    "Tag",
    ul(
        "Button",
        collapsible(
            "ContainerTag",
            ul(
                "Collapsible",
                "Confirm",
                "ListTag",
                "Table",
                "TableRow",
                "Tabs"
            ).classes("no-bullet"),
            "../../images/wedge.gif"
        ).rotation(90).imageSize(12, 12),
        "Image",
        "ListItem",
        collapsible (
            "ValueTag",
            ul(
                "CheckListItem",
                "ChooserTag",
                "DiscreteValueTag",
                "FormEntry",
                "InputTag",
                "Option",
                "RadioItem"
            ).classes("no-bullet"),
            "../../images/wedge.gif"
        ).rotation(90).imageSize(12, 12)
    ).classes("no-bullet"),
    "../../images/wedge.gif"
).rotation(90).imageSize(12, 12)