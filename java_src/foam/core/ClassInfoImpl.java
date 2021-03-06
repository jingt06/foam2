package foam.core;

import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;

public class ClassInfoImpl implements ClassInfo {
  private List axioms;
  private String id;

  public ClassInfoImpl() {
    axioms = new ArrayList();
  }

  public ClassInfo setId(String id) {
    this.id = id;
    return this;
  }

  private HashMap axiomsByName_ = new HashMap();

  private ClassInfo parent_ = null;

  public ClassInfo getParent() {
    if ( parent_ == null ) {
      Class c;
      java.lang.reflect.Method m;

      try {
        c = Class.forName(getId()).getSuperclass();
        m = c.getMethod("getOwnClassInfo");

        parent_ = (ClassInfo)m.invoke(null);
      } catch (NoSuchMethodException e) {
        parent_ = new EmptyClassInfo();
      } catch (Exception e) {
        throw new RuntimeException(e);
      }
    }

    return parent_;
  }

  public ClassInfo addProperty(PropertyInfo p) {
    p.setClassInfo(this);
    axioms.add(p);
    axiomsByName_.put(p.getName(), p);
    return this;
  }

  private List allAxioms_ = null;

  public List getAxioms() {
    if ( allAxioms_ == null ) {
      allAxioms_ = new ArrayList();
      allAxioms_.addAll(axioms);
      allAxioms_.addAll(getParent().getAxioms());
    }
    return allAxioms_;
  }

  public Object getAxiomByName(String name) {
    Object ret = axiomsByName_.get(name);
    if ( ret == null ) {
      ret = getParent().getAxiomByName(name);
    }
    return ret;
  }

  public String getId() {
    return id;
  }

  private HashMap axiomMap_ = new HashMap();

  public List getAxiomsByClass(Class cls) {
    if ( axiomMap_.containsKey(cls) ) {
      return (List)axiomMap_.get(cls);
    }

    ArrayList ret = new ArrayList();
    Iterator i = axioms.iterator();
    while ( i.hasNext() ) {
      Object axiom = i.next();
      if ( cls.isInstance(axiom) ) {
        ret.add(axiom);
      }
    }

    ret.addAll(getParent().getAxiomsByClass(cls));

    axiomMap_.put(cls, ret);
    return ret;
  }
}
