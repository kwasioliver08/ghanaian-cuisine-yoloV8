from eralchemy2 import render_er
from models import Base  # Imports your SQLAlchemy Base

# Render the ER diagram to a PNG image
render_er(Base, 'erd_diagram.png')
print("ER Diagram successfully generated as erd_diagram.png!")